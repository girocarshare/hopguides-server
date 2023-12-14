
import { IRequest, IResponse } from '../classes/interfaces';
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';

import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { BaseRouter } from './baseRouter';
import { UserManager } from '../manager/userManager';
import { deserialize } from '../json';
import { BPartnerManager } from '../manager/bpartnerManager';
import { Obj, POIManager } from '../manager/poiManager';
import { TourManager } from '../manager/tourManager';
import { Tour } from '../models/tours/tour';
import { ToursWithPoints } from '../classes/tour/toursWithPoints';
import { Image, POI } from '../models/tours/poiModel';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import 'reflect-metadata';
import { simpleAsync } from './util';
import * as multer from 'multer';
const axios = require('axios');
const stream = require('stream');
import 'es6-shim';
import * as AWS from 'aws-sdk';
import { Location, TourData } from '../classes/tour/tourData';
import { PointData } from '../classes/tour/pointData';
import { QRCodes } from '../models/qrcodes/qrcodes';
import { SearchPagination } from '../classes/searchPagination';
var multerS3 = require('multer-s3');
const { Configuration, OpenAIApi } = require("openai");
var gpxParser = require('gpxparser');
var gpxParse = require("gpx-parse");
const paginate = require('jw-paginate');
import * as sgMail from '@sendgrid/mail';
import { User } from '../models/user/user';
import { spawn } from 'child_process';
import { LocalizedField } from '../models/localizedField';
import { GeoLocation } from '../models/address/geoLocation';
import { stringAt } from 'pdfkit/js/data';
import { LibraryManager } from '../manager/libraryManager';
import { Library } from '../models/library/library';
import { POIVideo } from '../models/tours/poiModelVideo';
import { TourVideo } from '../models/tours/tourvideo';
import { TourVideoManager } from '../manager/tourVideoManager';

const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51MAy4gDmqfM7SoUzbMp9mpkECiaBifYevUo2rneRcI4o2jnF11HeY1yC5F1fiUApKjDIkkMUidTgmgStWvbyKLvx00Uvoij5vH');
const exec = require("child_process").exec;
const endpointSecret = "whsec_udE8WsgMxTywVI44nhBJtjoGuZzqB2Ce"//"whsec_a88418a9de74ae6a3247b02b4e9f09210947bb2ac864d040bf451140d72e2fc3";
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})


const client = require('@sendgrid/client');
client.setApiKey("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");

sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";
interface IBkRequest extends IRequest {
	tour: Tour;
}


function randomstring(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return result;
}

const configuration = new Configuration({
	apiKey: "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",
});
const openai = new OpenAIApi(configuration);


async function getTour(string) {

	return await axios.get(string)
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});

}


async function did(response, user) {
	// Function to sleep for 'ms' milliseconds
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	try {
		// Make the API call
		const res = await axios.get("https://api.d-id.com/talks/" + response.data.id, {
			headers: {
				'Authorization': `Basic ${user.didapi}`,
				'Content-Type': 'application/json'
			}
		});

		// Log the response for debugging
		console.log(res.data.status);

		// Check the status
		if (res.data.status === 'done') {
			return res.data.result_url;
		} else {
			// If status is not 'done', wait for 5 seconds and retry
			await sleep(5000);
			return await did(response, user);
		}
	} catch (err) {
		console.log("error " + err);
	}
}

export class TourRouter extends BaseRouter {
	tourManager: TourManager;
	tourVideoManager: TourVideoManager;
	libraryManager: LibraryManager;
	poiManager: POIManager;
	bpartnerManager: BPartnerManager;
	userManager: UserManager;
	fileFilter = (req, file, cb) => {
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3|mp4|PNG)$/)) {
			cb(null, true)
		} else {
			cb(null, false)
		}
	}

	multerS3Config = multerS3({
		s3: s3,
		bucket: 'hopguides/tours',
		acl: 'public-read',
		metadata: function (req, file, cb) {

			cb(null, { fieldName: globalThis.rString });
		},
		key: function (req, file, cb) {
			var list = file.originalname.split('.')
			globalThis.rString = randomstring(10) + "." + list[list.length - 1]
			cb(null, globalThis.rString)
		}
	});

	upload = multer({
		storage: this.multerS3Config,
		fileFilter: this.fileFilter,

	})
	constructor() {
		super(true);
		this.tourManager = new TourManager();
		this.tourVideoManager = new TourVideoManager();
		this.libraryManager = new LibraryManager();
		this.poiManager = new POIManager();
		this.userManager = new UserManager();
		this.bpartnerManager = new BPartnerManager();
		this.upload = multer({
			storage: this.multerS3Config,
			fileFilter: this.fileFilter,

		});
		this.init();
	}

	init(): void {

		this.router.get(
			'/backup/data',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					let backupProcess = 'mongodump --uri mongodb+srv://gogiro:BjfZKhiZZY9LxIvp@hopguides.wpiikah.mongodb.net/giro-staging --archive --gzip'

					const child = exec(backupProcess, (error, stdout, stderr) => {
						console.log(error)
						//console.log([backupProcess, error, backupDirPath]);
						//storeFileOnAzure(filePath);
					});

					const pass = new stream.PassThrough();
					child.stdout.pipe(pass);

					const params = {
						Bucket: 'hopguides/backup',
						Key: 'path/to/backup.gz',
						Body: pass
					};

					s3.upload(params, (err, data) => {
						if (err) {
							console.error('Error uploading to S3:', err);
						} else {
							console.log('Successfully uploaded data to S3:', data.Location);
						}
					});
				} catch (err) {
					return res.status(412).send("Qr code for this tour is already generated.");
				}


			})
		);


		//54387761ed3da88d440dbaddc4b218bd

		async function generateAudioFromText(text: string, voiceId: string) {
			const CHUNK_SIZE = 1024;
			const url = "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId;

			const headers = {
				"Accept": "audio/mpeg",
				"Content-Type": "application/json",
				"xi-api-key": "54387761ed3da88d440dbaddc4b218bd" // Make sure to secure your API key
			};

			const data = {
				"text": text,
				"model_id": "eleven_monolingual_v1",
				"voice_settings": {
					"stability": 0.5,
					"similarity_boost": 0.5
				}
			};

			try {
				const response = await axios.post(url, data, { headers: headers, responseType: 'stream' });
				const outputPath = path.join(__dirname, 'output.mp3');
				const writer = fs.createWriteStream(outputPath);

				response.data.pipe(writer);

				return new Promise((resolve, reject) => {
					writer.on('finish', resolve);
					writer.on('error', reject);
				});
			} catch (error) {
				console.error(error);
			}
		}
		async function downloadImage(url: string, outputPath: string): Promise<void> {
			const writer = fs.createWriteStream(outputPath);
			const response = await axios({
				url,
				method: 'GET',
				responseType: 'stream'
			});

			response.data.pipe(writer);

			return new Promise((resolve, reject) => {
				writer.on('finish', resolve);
				writer.on('error', reject);
			});
		}



		function createVideoWithImageAndAudio(imagePath: string, audioPath: string, outputPath: string): Promise<void> {
			return new Promise((resolve, reject) => {
				const command = `ffmpeg -loop 1 -i ${imagePath} -i ${audioPath} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest ${outputPath}`;
				exec(command, (error, stdout, stderr) => {
					if (error) {
						console.error(`Error: ${error.message}`);
						reject(error);
						return;
					}
					if (stderr) {
						console.error(`stderr: ${stderr}`);
					}
					resolve();
				});
			});
		}


	/*	this.router.post(
			'/d-id/generate',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				console.log("evo meeeeeeeeee")

				var user = await this.userManager.getUser(req.userId)
				var ofTokens = user.tokens - parseFloat(req.body.tokensneeded)


				if (ofTokens < 0) {
					return res.status(412).send({ message: "There are not enough tokens" });
				}
				var tokens = ofTokens

				user.tokens = tokens
				await this.userManager.updateUser(user.id, user)

				console.log(req.body)
				var img = ""
				var voice = ""

				if (req.body.voice != "") {
					if (req.body.voice == "Isabella") {

						voice = "z9fAnlkpzviPz146aGWa"

					} else if (req.body.voice == "Lorenzo") {
						voice = "zcAOhNBS3c14rBihAFp1"
					} else if (req.body.voice == "Maria") {
						voice = "oWAxZDx7w5VEj9dCyTzz"
					} else if (req.body.voice == "Johann") {
						voice = "TxGEqnHWrfWFTfGW9XjX"
					} else if (req.body.voice == "Nia") {
						voice = "ThT5KcBeYPX3keUQqHPh"
					} else if (req.body.voice == "Sam") {
						voice = "2EiwWnXFnvU5JabPnv8n"
					} else if (req.body.voice == "Esperanza") {
						voice = "EXAVITQu4vr4xnSDxMaL"
					} else if (req.body.voice == "Diego") {
						voice = "TX3LPaxmHKxFdv7VOQHJ"
					} else if (req.body.voice == "Sophie") {
						voice = "XrExE9yKIg1WjnnlVkGX"
					} else if (req.body.voice == "Samuel") {
						voice = "flq6f7yk4E4fJM5XTYuZ"
					}

				}
				if (req.body.character == "imgIsabella") {

					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/isabella.png"
					voice = "z9fAnlkpzviPz146aGWa"

				} else if (req.body.character == "imgLorenzo") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/lorenzo.png"
					voice = "zcAOhNBS3c14rBihAFp1"
				} else if (req.body.character == "imgMaria") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/maria.png"
					voice = "oWAxZDx7w5VEj9dCyTzz"
				} else if (req.body.character == "imgJohann") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/johann.png"
					voice = "TxGEqnHWrfWFTfGW9XjX"
				} else if (req.body.character == "imgNia") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/nia.png"
					voice = "ThT5KcBeYPX3keUQqHPh"
				} else if (req.body.character == "imgSam") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/sam.png"
					voice = "2EiwWnXFnvU5JabPnv8n"
				} else if (req.body.character == "imgEsperanza") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/esperanza.png"
					voice = "EXAVITQu4vr4xnSDxMaL"
				} else if (req.body.character == "imgDiego") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/diego.png"
					voice = "TX3LPaxmHKxFdv7VOQHJ"
				} else if (req.body.character == "imgSophie") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/sophie.png"
					voice = "XrExE9yKIg1WjnnlVkGX"
				} else if (req.body.character == "imgSamuel") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/samuel.png"
					voice = "flq6f7yk4E4fJM5XTYuZ"
				} else {
					img = req.body.character
				}

				function removeSpecialCharacters(inputString: string): string {
					// Remove all characters that are not alphanumeric
					const cleanedString = inputString.replace(/[^a-zA-Z0-9,.':;?! ]/g, '');
					return cleanedString;
				}

				const cleanedString: string = removeSpecialCharacters(JSON.stringify(req.body.words));

				// Regular expression to match the end of a sentence
				const firstSentenceRegex = /^[^.!?]*[.!?]/;

				// Extract the first sentence
				const firstSentenceMatch = cleanedString.match(firstSentenceRegex);
				const firstSentence = firstSentenceMatch?.[0] || '';

				// Extract the rest of the text
				const restOfText = firstSentenceMatch ? cleanedString.slice(firstSentenceMatch[0].length) : cleanedString;

				console.log("First Sentence:", firstSentence);
				console.log("Rest of the Text:", restOfText);


				await generateAudioFromText(restOfText, voice)


				const imageUrl = img;
				const imagePath = path.join(__dirname, 'image.png');
				const audioPath = path.join(__dirname, 'output.mp3'); // Path to your audio file
				const videoPath = path.join(__dirname, 'outputVideo.mp4'); // Output video file path

				// Download image and create video
				downloadImage(imageUrl, imagePath)
					.then(() => createVideoWithImageAndAudio(imagePath, audioPath, videoPath))
					.then(() => console.log('Video created successfully'))
					.catch(error => console.error(error));


				const data = JSON.parse(`{
					"script": {
					  "type": "text",
					  "input": "${firstSentence}",
					  "provider":{
						"type":"elevenlabs",
						"voice_id":"${voice}",
						"voice_config":{
							"stability":0.3,
							"similarity_boost":0.7
							}
						  }
					},
					"source_url": "${img}",
					"config": {
						"stitch": true
					}
				  }`)



				await axios.post("https://api.d-id.com/talks", data, {
					headers: {
						'Authorization': `Basic ${user.didapi}`,
						'Content-Type': 'application/json'
					}
				})
					.then(async response => {
						var resp = await did(response, user)
						console.log("RESPONSEEEE")
						console.log(resp)
					
						const dIdVideoPath = path.join(__dirname, 'dIdVideo.mp4');

						// Function to download the D-ID video
						downloadImage(resp, dIdVideoPath)
							.then(() => {
								console.log('D-ID Video downloaded successfully');
								const outputVideoPath = path.join(__dirname, 'outputVideo.mp4'); // Path to your existing output video
								const finalVideoPath = path.join(__dirname, 'outputVideoFinal.mp4'); // Path for the final combined video
						
								// Combine the D-ID video and the existing output video
								return combineVideos(dIdVideoPath, outputVideoPath, finalVideoPath);
							})
							.then(() => {
								console.log('Videos combined successfully');
								// Further processing or response sending
							})
							.catch(error => console.error(error));

						
						var generatedVideo: string = await this.libraryManager.saveGeneratedVideo(resp);
						var qrCode: string = await this.libraryManager.generateQr(generatedVideo);

						var library: Library = new Library()
						library.url = generatedVideo
						library.qrcode = qrCode
						library.userId = req.userId

						var libraryVideo: Library = await this.libraryManager.create(library);

						res.status(200).send({ data: resp, tokens: tokens });



					})
					.catch(error => {

						console.log(error)
						return res.status(402).send({ message: error.response.data.description });
					});


				})
		);*/

		this.router.post(
			'/d-id/generate',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				var user = await this.userManager.getUser(req.userId)
				var ofTokens = user.tokens - parseFloat(req.body.tokensneeded)


				if (ofTokens < 0) {
					return res.status(412).send({ message: "There are not enough tokens" });
				}
				var tokens = ofTokens

				user.tokens = tokens
				await this.userManager.updateUser(user.id, user)

				console.log(req.body)
				var img = ""
				var voice = ""

				if (req.body.voice != "") {
					if (req.body.voice == "Isabella") {

						voice = "z9fAnlkpzviPz146aGWa"

					} else if (req.body.voice == "Lorenzo") {
						voice = "zcAOhNBS3c14rBihAFp1"
					} else if (req.body.voice == "Maria") {
						voice = "oWAxZDx7w5VEj9dCyTzz"
					} else if (req.body.voice == "Johann") {
						voice = "TxGEqnHWrfWFTfGW9XjX"
					} else if (req.body.voice == "Nia") {
						voice = "ThT5KcBeYPX3keUQqHPh"
					} else if (req.body.voice == "Sam") {
						voice = "2EiwWnXFnvU5JabPnv8n"
					} else if (req.body.voice == "Esperanza") {
						voice = "EXAVITQu4vr4xnSDxMaL"
					} else if (req.body.voice == "Diego") {
						voice = "TX3LPaxmHKxFdv7VOQHJ"
					} else if (req.body.voice == "Sophie") {
						voice = "XrExE9yKIg1WjnnlVkGX"
					} else if (req.body.voice == "Samuel") {
						voice = "flq6f7yk4E4fJM5XTYuZ"
					}

				}
				if (req.body.character == "imgIsabella") {

					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/isabella.png"
					voice = "z9fAnlkpzviPz146aGWa"

				} else if (req.body.character == "imgLorenzo") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/lorenzo.png"
					voice = "zcAOhNBS3c14rBihAFp1"
				} else if (req.body.character == "imgMaria") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/maria.png"
					voice = "oWAxZDx7w5VEj9dCyTzz"
				} else if (req.body.character == "imgJohann") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/johann.png"
					voice = "TxGEqnHWrfWFTfGW9XjX"
				} else if (req.body.character == "imgNia") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/nia.png"
					voice = "ThT5KcBeYPX3keUQqHPh"
				} else if (req.body.character == "imgSam") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/sam.png"
					voice = "2EiwWnXFnvU5JabPnv8n"
				} else if (req.body.character == "imgEsperanza") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/esperanza.png"
					voice = "EXAVITQu4vr4xnSDxMaL"
				} else if (req.body.character == "imgDiego") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/diego.png"
					voice = "TX3LPaxmHKxFdv7VOQHJ"
				} else if (req.body.character == "imgSophie") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/sophie.png"
					voice = "XrExE9yKIg1WjnnlVkGX"
				} else if (req.body.character == "imgSamuel") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/samuel.png"
					voice = "flq6f7yk4E4fJM5XTYuZ"
				} else {
					img = req.body.character
				}

				function removeSpecialCharacters(inputString: string): string {
					// Remove all characters that are not alphanumeric
					const cleanedString = inputString.replace(/[^a-zA-Z0-9,.':; ]/g, '');
					return cleanedString;
				}

				console.log(req.body.words)
				const cleanedString: string = removeSpecialCharacters(JSON.stringify(req.body.words));

				console.log(cleanedString)
				const data = JSON.parse(`{
					"script": {
					  "type": "text",
					  "input": "${cleanedString}",
					  "provider":{
						"type":"elevenlabs",
						"voice_id":"${voice}",
						"voice_config":{
							"stability":0.3,
							"similarity_boost":0.7
							}
					 	}
					},
					"source_url": "${img}",
					"config": {
						"stitch": true
					}
				  }`)



				await axios.post("https://api.d-id.com/talks", data, {
					headers: {
						'Authorization': `Basic ${user.didapi}`,
						'Content-Type': 'application/json'
					}
				})
					.then(async response => {
						var resp = await did(response, user)

						var generatedVideo: string = await this.libraryManager.saveGeneratedVideo(resp);
						var qrCode: string = await this.libraryManager.generateQr(generatedVideo);

						var library: Library = new Library()
						library.url = generatedVideo
						library.qrcode = qrCode
						library.userId = req.userId

						var libraryVideo: Library = await this.libraryManager.create(library);

						res.status(200).send({ data: resp, tokens: tokens });



					})
					.catch(error => {

						console.log(error)
						return res.status(402).send({ message: error.response.data.description });
					});


			})
		);



		
function combineVideos(video1Path: string, video2Path: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(video1Path)
            .input(video2Path)
            .on('error', (err) => {
                console.error('Error: ' + err.message);
                reject(err);
            })
            .on('end', () => {
                console.log('Videos combined successfully');
                resolve();
            })
            .mergeToFile(outputPath, '/tmp');
    });
}

		/** GET generate qr code for tour */
		this.router.get(
			'/getlibrary/videos',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					var videos: Library[] = await this.libraryManager.getVideos(req.userId);
					return res.status(200).send(videos);

				} catch (err) {
					return res.status(412).send("Error while getting videos");
				}


			})
		);


		this.router.get(
			'/d-id/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				axios.get("https://api.d-id.com/talks/tlk_1mKjC8X2fs9eQIUtBOTGd", {
					headers: {
						'Authorization': `Basic bHVuYXppdmtvdmljKzFAZ21haWwuY29t:7DyJuingHY4tMae09rwWY`,
						'Content-Type': 'application/json'
					}
				})
					.then(response => {
						console.log(response)
					})
					.catch(error => {
						console.log("error " + error)
					});


			})
		);

		this.router.get(
			'/d-id/api/:api',
			//allowFor([AdminRole, SupportRole, ServiceRole]),	
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				var user = await this.userManager.getUser(req.userId)

				user.didapi = req.params.api
				await this.userManager.updateUser(user.id, user)

				return res.status(200).send("success")


			})
		);
		this.router.post(
			'/chat/openAI',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const { prompt } = req.body;

				// Generate a response with ChatGPT
				const completion = await openai.createCompletion({
					model: "text-davinci-002",
					prompt: prompt,
					max_tokens: 2500,
					n: 1
				});
				res.send(completion.data.choices[0].text);
			})
		);


		this.router.post(
			'/get/demovideo',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					console.log(req.body)
					console.log(req.userId)
					const user: User = await this.userManager.getUser(req.userId);
					//conditions to decide which video to send

					/*	sgMail.send({
							to: user.email, // change so that poi.contact.email gets email
							from: emailSender,
							subject: "Hopguides demo tour",
							html: `Dear,<br/><br/>
								
								Here I'm sending demo video <br/><br/> Kind regards, Hopguides. <br/>
								`
						})*/

					return res.status(200).send("success");
				} catch {

					return res.status(412).send("error");
				}
			})
		);

		/** GET generate qr code for tour */
		this.router.get(
			'/qr/:tourId/:number',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					const tour: Tour = await this.tourManager.getTour(req.params.tourId);
					if (tour != null) {
						var qrCodes: QRCodes[] = await this.tourManager.generateQr(req.params.tourId, Number.parseInt(req.params.number));
						return res.status(200).send(qrCodes);
					} else {
						return res.status(412).send("Tour doesn't exist");
					}
				} catch (err) {
					return res.status(412).send("Qr code for this tour is already generated.");
				}


			})
		);

		/** GET already generated qr code for tour */
		this.router.get(
			'/getqrcodes/:tourId',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					const tour: Tour = await this.tourManager.getTour(req.params.tourId);
					if (tour != null) {
						var qr = await this.tourManager.getQRForTour(req.params.tourId);
						return res.status(200).send(qr);
					} else {
						return res.status(412).send("Tour doesn't exist");
					}
				} catch (err) {
					return res.status(412).send("Qr codes for this tour doesn't exist.");
				}


			})
		);



		/** GET fetches tour list for admin panel */
		this.router.get(
			'/all',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const tours: Tour[] = await this.tourManager.getTours();
				return res.status(200).send(tours);

			})
		);

		this.router.get(
			'/gettourdata/:id',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const tour: Tour = await this.tourManager.getTourData(req.params.id);

				return res.status(200).send(tour);

			})
		);

		this.router.get(
			'/getpoidata/:id',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const poi: POI = await this.tourManager.getPoiData(req.params.id);

				return res.status(200).send(poi);

			})
		);

		this.router.get(
			'/search/:data',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const pagination: SearchPagination = new SearchPagination();
				pagination.page = 0;
				pagination.pageSize = 2;

				const pageOfItems: ToursWithPoints[] = await this.tourManager.searchForTours(req.userId, req.params.data, null, pagination);

				const pager = {
					currentPage: Number.parseInt(req.params.page)
				};

				return res.json({ pager, pageOfItems });

			})
		);

		this.router.get(
			'/allToursWithPoints/:page',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {



				const pagination: SearchPagination = new SearchPagination();
				pagination.page = Number.parseInt(req.params.page);
				pagination.pageSize = 2;

				const pageOfItems: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false, null, pagination);

				const pager = {
					currentPage: Number.parseInt(req.params.page)
				};

				return res.json({ pager, pageOfItems });

			})
		);


		this.router.get(
			'/allUpdatedToursWithPoints/:page',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const pagination: SearchPagination = new SearchPagination();
				pagination.page = Number.parseInt(req.params.page);
				pagination.pageSize = 2;

				const pageOfItems: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, true, null, pagination);

				const pager = {
					currentPage: Number.parseInt(req.params.page)
				};

				return res.json({ pager, pageOfItems });

			})
		);


		this.router.get(
			'/previousReport/:tourId',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				if (req.params.tourId == null) {
					res.status(200)
				} else {
					const filter: any = {};
					const data: PreviousTourReport[] = await this.tourManager.getPreviousReportForTour(req.params.tourId, filter);
					return res.status(200).send(data);
				}
			})
		);
		/** GET languages */
		this.router.get(
			'/languages',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const languages: string[] = ["English", "Slovenian", "Serbian", "Spanish"];
				return res.status(200).send(languages);
			})
		);

		/** DELETE tour */
		this.router.get(
			'/deleteTour/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					await this.tourManager.deleteTour(req.params.tourId);

					const pagination: SearchPagination = new SearchPagination();
					pagination.page = Number.parseInt(req.params.page);
					pagination.pageSize = 2;

					const pageOfItems: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, true, null, pagination);

					const pager = {
						currentPage: Number.parseInt(req.params.page)
					};

					return res.json({ pager, pageOfItems });


				} catch (e) {

					return res.status(500).send("Error");
				}
			})
		);

		/** DELETE poi from tour*/
		this.router.get(
			'/deletePoi/:tourId/:poiId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					await this.tourManager.deletePoi(req.params.tourId, req.params.poiId);

					const pagination: SearchPagination = new SearchPagination();
					pagination.page = 0;
					pagination.pageSize = 2;

					const pageOfItems: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false, null, pagination);

					const pager = {
						currentPage: 0
					};

					return res.json({ pager, pageOfItems });
				} catch (e) {

					return res.status(500).send("Error");
				}
			})
		);
		/** POST fetches tour data */
		this.router.post(
			'/:qrCodeId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				//TODO
				const tour: TourData = await this.tourManager.getSingleTour(req.params.qrCodeId, "", "", req.body.language);
				return res.status(200).send(tour);
			})
		);

		/** POST fetches points data for a tour */
		this.router.post(
			'/points/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const tour: PointData[] = await this.tourManager.getTourPoints(req.params.tourId, req.body.language, req.body.bookingId);
				return res.status(200).send(tour);
			})
		);



		/** POST fetches points data for a tour */
		this.router.get(
			'/geojson/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					var response = ""
					var tour1 = await this.tourManager.getTour(req.params.tourId)
					if (tour1 != null) {
						if (tour1.gpx != null) {

							return res.status(200).send(tour1.gpx);

						} else {
							var tour = await this.tourManager.getToursWithPointsForMapbox(req.params.tourId)

							var url = "https://api.mapbox.com/directions/v5/mapbox/cycling/"

							for (var poi of tour.points) {
								url += poi.location.latitude + "%2C" + poi.location.longitude + "%3B"
							}

							url = url.substring(0, url.length - 3);
							url += "?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A"
							await getTour(url)
								.then(res =>
									response = res.routes[0].geometry.coordinates)

							var str = "["
							for (var objec of response) {


								str += "[" + objec[0].toString().slice(0, 8) + "," + objec[1].toString().slice(0, 8) + "],"
								str += "[" + objec + "],"

							}
							str += "]"


							return res.status(200).send(str);

						}
					}
				} catch (e) {
					console.log(e)
				}



			})
		);

		function getSubstring(string: string, char1: string, char2: string) {
			return string.slice(
				string.indexOf(char1) + 1,
				string.lastIndexOf(char2),
			);
		}


		/** POST fetches points data for a tour */
		this.router.post(
			'/parse/gpx',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				var response = []
				var gpx = new gpxParser(); //Create gpxParser Object
				gpx.parse(req.body.text); //parse gpx file from string data

				for (var item of gpx.tracks[0].points) {
					var obj = []
					obj.push(item.lon.toString().slice(0, 8))
					obj.push(item.lat.toString().slice(0, 8))
					response.push(obj)
				}

				var tour = await this.tourManager.getTour(req.body.id)
				if (tour != null) {

					var str = "["
					for (var objec of response) {
						str += "[" + objec + "],"

					}
					str += "]"

					console.log(str)
					tour.gpx = str;
					await this.tourManager.updateTour(
						tour.id,
						tour
					);
				} else {
					return res.status(412).send("Tour doesnt exist");
				}

				return res.status(200).send(response);


			})
		);


		/** GET terms and conditions for a tour */
		this.router.get(
			'/termsandconditions/:id',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var termsAndConditions = await this.tourManager.getTermsAndConditions(req.params.id);
				return res.status(200).send(termsAndConditions);
			})
		);

		/**  */
		this.router.get(
			'/approve/:tourid',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					var tour = await this.tourManager.getTour(req.params.tourid)
					tour.update = false;
					await this.tourManager.updateTour(
						tour.id,
						tour
					);
					var bpartner = await this.bpartnerManager.getBP(tour.bpartnerId)
					await this.tourManager.deleteUpdatedTour(
						tour.previousId
					);

					for (var poi of tour.points) {
						var point = await this.poiManager.getPoi(poi)
						if (point.previousId) {
							await this.poiManager.deletePOI(
								point.previousId
							);
						}
					}

					const pagination: SearchPagination = new SearchPagination();
					pagination.page = 0;
					pagination.pageSize = 2;

					const pageOfItems: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, true, null, pagination);

					const pager = {
						currentPage: 0
					};


					sgMail.send({
						to: bpartner.contact.email, // change so that poi.contact.email gets email
						from: emailSender,
						subject: "Tour changes accepted",
						html: `Dear,<br/><br/>
							
							Changes made on tour with id: ${tour.id} and name ${tour.title.english} has been approved by admin. <br/><br/> Kind regards, Hopguides. <br/>
							`
					})
					return res.json({ pager, pageOfItems });

				} catch (err) {
					console.log(err.error)
				}
			})
		);


		/**  */
		this.router.get(
			'/disapprove/:tourid',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					var tour = await this.tourManager.getTour(req.params.tourid)
					await this.tourManager.deleteUpdatedTour(
						req.params.tourid
					);
					for (var poi of tour.points) {
						var point = await this.poiManager.getPoi(poi)
						if (point.previousId) {
							await this.poiManager.deletePOI(
								poi
							);
						}
					}


					var bpartner = await this.bpartnerManager.getBP(tour.bpartnerId)
					sgMail.send({
						to: bpartner.contact.email, // change so that poi.contact.email gets email
						from: emailSender,
						subject: "Tour changes disapproved",
						html: `Dear,<br/><br/>
							
							Changes made on tour with id: ${tour.previousId} and name ${tour.title.english} has been diapproved by admin. <br/><br/> Kind regards, Hopguides. <br/>
							`
					})
					const pagination: SearchPagination = new SearchPagination();
					pagination.page = 0;
					pagination.pageSize = 2;

					const pageOfItems: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, true, null, pagination);

					const pager = {
						currentPage: 0
					};

					return res.json({ pager, pageOfItems });
				} catch (err) {
					console.log(err)
				}
			})
		);

		/** PATCH patch tour from ADMIN user */
		this.router.post(
			'/update/tour',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;

					var user = await this.userManager.getUser(req.userId)

					var tourprev = await this.tourManager.getTourByPreviousId(tour.id)
					var touroriginal = await this.tourManager.getTour(tour.id)

					if (tourprev != null) {
						if (user.role == "ADMIN") {
							return res.status(412).send("Tour already updated by partner");
						}
						for (var file of req.files) {
							if (file.originalname.substring(0, 5).trim() === 'image') {

								await this.tourManager.uploadMenu(tour.id, file);

							} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

								await this.tourManager.uploadAudio(tour.id, file);

							}
						}
						tourprev.update = false;
						await this.tourManager.updateTour(
							tourprev.id,
							tour
						);

						sgMail.send({
							to: "luna.zivkovic@gogiro.app", // change so that poi.contact.email gets email
							from: emailSender,
							subject: "Tour updated",
							html: `Dear,<br/><br/>
								
								Tour with id: ${tourprev.id} and name ${tourprev.title.english} has been updated by partner with id ${req.userId}. Please approve or disapprove the changes. <br/><br/> <br/>
								`
						})


					} else {
						if (user.role == "PROVIDER") {
							for (var file of req.files) {
								if (file.originalname.substring(0, 5).trim() === 'image') {

									await this.tourManager.uploadMenu(tour.id, file);

								} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

									await this.tourManager.uploadAudio(tour.id, file);

								}
							}

							tour.previousId = tour.id
							tour.update = true;
							var t = await this.tourManager.createTour(
								deserialize(Tour, touroriginal)
							);
							await this.tourManager.updateTour(
								t.id,
								tour
							);

							sgMail.send({
								to: "luna.zivkovic@gogiro.app", // change so that poi.contact.email gets email
								from: emailSender,
								subject: "Tour updated",
								html: `Dear,<br/><br/>
									
									Tour with id: ${t.id} and name ${tour.title.english} has been updated by partner with id ${req.userId}. Please approve or disapprove the changes. <br/><br/> <br/>
									`
							})


						} else if (user.role == "ADMIN") {


							for (var file of req.files) {
								if (file.originalname.substring(0, 5).trim() === 'image') {

									await this.tourManager.uploadMenu(tour.id, file);

								} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

									await this.tourManager.uploadAudio(tour.id, file);

								}
							}
							tour.update = false;
							await this.tourManager.updateTour(
								tour.id,
								tour
							);
						}
						const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
						return res.status(200).send(tours);
					}

				} catch (err) {
					console.log(err.error)
				}
			})
		);

		this.router.post(
			'/addFull/add',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			//this.upload.single('audio'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;

					tour.update = false;
					var arr: string[] = []
					var arr2 = []

					if (tour.points.length != 0) {
						for (var point of tour.points) {

							const poi: POI = await this.poiManager.createPOI(deserialize(POI, point));

							var poiJson = deserialize(POI, point)


							arr.push(poi.id)
							arr2.push(poi)
						}

						var partnerImages = []
						for (var f of req.files) {

							if (f.originalname.substring(1, 8).trim() === 'partner') {

								var help = f.originalname.split('---')

								var help2 = help[0].substring(8)

								var h = {
									name: help2,
									path: f.location
								}
								partnerImages.push(h)
							}
						}

						//if the names are the same
						var arrayy = []
						for (var i of arr2) {
							for (var im of partnerImages) {

								if (im.name == i.num) {


									arrayy.push(im.path);
								}
							}

							var obj: Obj = new Obj();


							obj.paths = arrayy
							await this.poiManager.uploadImages(i.id, obj);
							arrayy = []
						}

						for (var i of arr2) {
							for (var f of req.files) {

								if (f.originalname.substring(0, 6).trim() === 'audio2') {

									var help = f.originalname.split('---')

									var help2 = help[0].substring(6)

									if (help2 == i.num) {
										await this.poiManager.uploadAudio(i.id, f.location);
									}
								}
							}
						}
					}

					var t = {
						title: tour.title,
						shortInfo: tour.shortInfo,
						longInfo: tour.longInfo,
						price: tour.price,
						currency: tour.currency,
						duration: tour.duration,
						length: tour.length,
						highestPoint: tour.highestPoint,
						termsAndConditions: tour.termsAndConditions,
						agreementTitle: tour.agreementTitle,
						agreementDesc: tour.agreementDesc,
						bpartnerId: tour.bpartnerId,
						update: tour.update,
						points: arr
					}

					console.log(t)
					const createdTour: Tour = await this.tourManager.createTour(
						deserialize(Tour, t)
					);


					for (var file of req.files) {
						if (file.originalname.substring(0, 5).trim() === 'image') {

							await this.tourManager.uploadMenu(createdTour.id, file);

						} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

							await this.tourManager.uploadAudio(createdTour.id, file);

						}
					}

					//const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
					return res.status(200).send("Success");

				} catch (err) {
					console.log(err.error)
				}

			})
		);


		this.router.post(
			'/addFull/partner',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			//this.upload.single('audio'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;

					var arr: string[] = []
					var arr2 = []
					if (tour.points.length != 0) {
						for (var point of tour.points) {

							const poi: POI = await this.poiManager.createPOI(deserialize(POI, point));

							var poiJson = deserialize(POI, point)



							arr.push(poi.id)
							arr2.push(poi)
						}

						var partnerImages = []

						for (var f of req.files) {

							if (f.originalname.substring(1, 8).trim() === 'partner') {

								var help = f.originalname.split('---')

								var help2 = help[0].substring(8)

								var h = {
									name: help2,
									path: f.location
								}
								partnerImages.push(h)
							}


						}
						//if the names are the same
						var arrayy = []
						for (var i of arr2) {
							for (var im of partnerImages) {

								if (im.name == i.num) {

									arrayy.push(im.path);

								}
							}

							var obj: Obj = new Obj();


							obj.paths = arrayy
							await this.poiManager.uploadImages(i.id, obj);
							arrayy = []
						}


						for (var i of arr2) {
							for (var f of req.files) {

								if (f.originalname.substring(0, 6).trim() === 'audio2') {

									var help = f.originalname.split('---')

									var help2 = help[0].substring(6)

									if (help2 == i.num) {
										await this.poiManager.uploadAudio(i.id, f.location);
									}
								}
							}
						}
					}
					var t: Tour = await this.tourManager.getTour(
						tour.id,
					);

					var pois = t.points
					for (var p of arr) {
						pois.push(p)
					}
					t.points = pois


					await this.tourManager.updateTour(
						t.id,
						deserialize(Tour, t)
					);

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
					return res.status(200).send(tours);

				} catch (err) {
					console.log(err.error)
				}

			})
		);



		this.router.post(
			'/add/teasertour',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				// Upload
				try {

					console.log(req.body.tour)

					let jsonObj = JSON.parse(`{"price":"45","image":"https://hopguides.s3.eu-central-1.amazonaws.com/tours/7BUv3BsMeK.jpg","audio":"https://hopguides.s3.eu-central-1.amazonaws.com/tours/lu3FaaUm0Z.mp3","points":[],"duration":"4h","length":"11km","highestPoint":"155m","termsAndConditions":"","currency":"€","bpartnerId":"fd373bf5-6804-4293-b030-9be788516677","update":false,"title":{"english":" Ljubljana tour ","slovenian":"-"},"agreementTitle":{"english":"/ ","slovenian":" -"},"agreementDesc":{"english":"/","slovenian":"- "},"shortInfo":{"english":"Amidst a sprawling landscape of rolling plains and dense forests, this city blends history and modernity. Ancient stone pathways lead to market squares, while skyscrapers echo its aspirations. Parks offer respite from urban life, trails leading to endless plains. Beyond, nature's grandeur awaits, with woodlands and plains whispering tales of nomads and ancient civilizations. Seasons bring transformations, ever-changing vistas in this jewel of nature's crown. ","slovenian":"- "},"longInfo":{"english":" Amidst a sprawling landscape of rolling plains and dense forests, a city stands as a beacon of culture and progress. Its boundaries are marked by meandering rivers that shimmer under the sun, reflecting the city's skyline. On one side, the vast expanse of a tranquil lake borders the city, its waters often dotted with sailboats and kayakers enjoying the serenity. The city itself is a harmonious blend of history and modernity. Ancient stone pathways lead to market squares where traditions of old are kept alive, while towering skyscrapers in the distance echo the city's aspirations for the future. The green canopy of parks offers a respite from the urban hustle, with trails leading to the outskirts where the plains stretch out, seemingly endless. Beyond the city, the landscape is a testament to nature's grandeur. Dense woodlands, home to diverse wildlife, invite explorers to uncover their secrets. The plains, golden during the day and silver under the moonlight, whisper tales of nomads and ancient civilizations. As the seasons change, so does the landscape. From the blossoms of spring to the golden hues of autumn, the city and its surroundings transform, offering ever-changing vistas and experiences. In this vast and varied landscape, the city stands proud, a jewel in nature's magnificent crown.","slovenian":"-"}}`);
					let tour = jsonObj as Tour;


					class PointHelp {
						title: string
						longitude: string
						latitude: string
						num: string
					}
					class HelpTour {
						title: string
						points: PointHelp[]
					}
					let jsonObj2 = JSON.parse(req.body.tour);
					let tour2 = jsonObj2 as HelpTour;

					tour.title.english = tour2.title

					var points = []
					var pointsData = []
					for (var i = 0; i < tour2.points.length; i++) {
						var point = new POI//deserialize(POI, tour.points[i])
						//let point = poi as unknown as POI;
						point.num = tour2.points[i].num
						point.audio = "https://hopguides.s3.amazonaws.com/menu/ZwOsbG5A95.mp3"
						point.images = []
						var image = new Image
						image.image = "https://hopguides.s3.amazonaws.com/menu/sG0Ptf6OQG.png"


						point.images.push(image)
						point.price = 0
						point.offerName = ""
						point.contact = { "phone": "", "email": "", "webURL": "", "name": "" }
						point.location = new GeoLocation
						point.workingHours = { "monday": { "from": "", "to": "" }, "tuesday": { "from": "", "to": "" }, "wednesday": { "from": "", "to": "" }, "thursday": { "from": "", "to": "" }, "friday": { "from": "", "to": "" }, "saturday": { "from": "", "to": "" }, "sunday": { "from": "", "to": "" } }
						point.bpartnerId = "fd373bf5-6804-4293-b030-9be788516677"
						point.category = "NATURE"
						point.shortInfo = new LocalizedField
						point.shortInfo.english = " In the heart of a vibrant metropolis stands an enchanting architectural marvel. Its grand façade tells stories of the past, while inside, opulent art and ancient relics await. This point of interest is not just a celebration of history but also a vibrant cultural center, hosting diverse events. A journey here is a captivating experience, igniting wonder and appreciation for human expression. Whether a history buff, art enthusiast, or curious soul, it leaves an unforgettable impression, yearning for more. "
						point.shortInfo.slovenian = " - "

						point.longInfo = new LocalizedField
						point.longInfo.english = "In the heart of a vibrant metropolis lies a captivating point of interest, a place that enchants locals and tourists alike. This architectural marvel stands tall, defying time and weather, weaving together the past and present with exquisite craftsmanship. Its grand façade, adorned with intricate carvings and sculptures, tells the stories of a bygone era. Step inside, and you are transported to a realm of opulence and elegance. The interior boasts a breathtaking display of art, from striking murals that adorn the ceilings to delicate mosaics that grace the floors. Each room exudes a unique ambiance, carrying the essence of the period it represents. As you wander through the labyrinth of hallways and chambers, you encounter relics of history preserved with utmost care. Ancient artifacts whisper tales of ancient civilizations, while carefully curated exhibits shed light on the region's rich cultural heritage. The point of interest not only celebrates history but also serves as a vibrant cultural center. Throughout the year, it hosts an array of events, from art exhibitions and classical concerts to traditional dance performances and contemporary showcases. Here, art and culture blend seamlessly, offering a delightful experience to enthusiasts from all walks of life. Visiting this point of interest is like embarking on a captivating journey through time and creativity. It leaves a lasting impression, igniting a sense of wonder and appreciation for the beauty and diversity of human expression. Whether you are an avid history buff, an art aficionado, or simply a curious soul seeking inspiration, this point of interest promises to be an unforgettable destination that leaves you yearning for more."
						point.longInfo.slovenian = " - "
						point.name = new LocalizedField
						point.name.slovenian = " - "
						point.name.english = tour2.points[i].title
						point.location.longitude = tour2.points[i].longitude
						point.location.latitude = tour2.points[i].latitude

						const poi: POI = await this.poiManager.createPOI(point);

						points.push(poi.id)
						pointsData.push(poi)
					}
					tour.points = points
					console.log(tour)

					var partnerImages = []

					for (var f of req.files) {

						if (f.originalname.substring(1, 8).trim() === 'partner') {

							var help = f.originalname.split('---')

							var help2 = help[0].substring(8)

							var h = {
								name: help2,
								path: f.location
							}
							partnerImages.push(h)
						}


					}

					console.log(partnerImages)

					console.log(pointsData)
					//if the names are the same
					var arrayy = []
					for (var po of pointsData) {
						for (var im of partnerImages) {

							if (im.name == po.num) {

								arrayy.push(im.path);

							}
						}

						var obj: Obj = new Obj();

						obj.paths = arrayy
						obj.names = []
						for (var i = 0; i < tour2.points.length; i++) {
							var objec = {
								number: "1",
								name: new LocalizedField
							}
							objec.name.english = "title"
							obj.names.push(objec)
						}
						await this.poiManager.uploadImages(po.id, obj);
						arrayy = []
					}

					const createdTour: Tour = await this.tourManager.createTour(
						deserialize(Tour, tour)
					);



					for (var file of req.files) {
						console.log(file)
						if (file.originalname.substring(0, 5).trim() === 'image') {

							await this.tourManager.uploadMenu(createdTour.id, file);

						}
					}


					return res.status(200).send("Success");


				} catch (err) {
					console.log(err)
				}
			})
		);



		this.router.post(
			'/d-id/premade',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				var user = await this.userManager.getUser(req.userId)
				var ofTokens = user.tokens - parseFloat(req.body.tokensneeded)


				if (ofTokens < 0) {
					return res.status(412).send({ message: "There are not enough tokens" });
				}
				var tokens = ofTokens

				user.tokens = tokens
				await this.userManager.updateUser(user.id, user)

				console.log(req.body)
				var img = ""
				var voice = ""

				if (req.body.character == "imgIsabella") {

					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/isabella.png"
					voice = "z9fAnlkpzviPz146aGWa"

				} else if (req.body.character == "imgLorenzo") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/lorenzo.png"
					voice = "zcAOhNBS3c14rBihAFp1"
				} else if (req.body.character == "imgMaria") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/maria.png"
					voice = "oWAxZDx7w5VEj9dCyTzz"
				} else if (req.body.character == "imgJohann") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/johann.png"
					voice = "TxGEqnHWrfWFTfGW9XjX"
				} else if (req.body.character == "imgNia") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/nia.png"
					voice = "ThT5KcBeYPX3keUQqHPh"
				} else if (req.body.character == "imgSam") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/sam.png"
					voice = "2EiwWnXFnvU5JabPnv8n"
				} else if (req.body.character == "imgEsperanza") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/esperanza.png"
					voice = "EXAVITQu4vr4xnSDxMaL"
				} else if (req.body.character == "imgDiego") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/diego.png"
					voice = "TX3LPaxmHKxFdv7VOQHJ"
				} else if (req.body.character == "imgSophie") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/sophie.png"
					voice = "XrExE9yKIg1WjnnlVkGX"
				} else if (req.body.character == "imgSamuel") {
					img = "https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/samuel.png"
					voice = "flq6f7yk4E4fJM5XTYuZ"
				}

				console.log(img)


				const data = JSON.parse(`{
					"script": {
					  "type": "text",
					  "input": "Hello and welcome. We're genuinely excited to have you here. Let's quickly touch on a few essentials to make your arrival seamless. Once you're here, our reception desk is where you'll start. They'll guide you through the check-in process. You'll be given access to your room, either through a key card or a digital method. Please remember that check-in starts from ${req.body.checkIn}, and please check out by ${req.body.checkOut}. Of course, we're always here to help, so if you have any questions or need flexibility, don't hesitate to ask. Welcome again, we hope you have a memorable stay.",
					  "provider":{
						"type":"elevenlabs",
						"voice_id":"${voice}",
						"voice_config":{
							"stability":0.3,
							"similarity_boost":0.7
							}
					 	}
					},
					"source_url": "${img}",
					"config": {
						"stitch": true
					}
				  }`)

				await axios.post("https://api.d-id.com/talks", data, {
					headers: {
						'Authorization': `Basic ${user.didapi}`,
						'Content-Type': 'application/json'
					}
				})
					.then(async response => {
						console.log(response)
						var resp = await did(response, user)

						var generatedVideo: string = await this.libraryManager.saveGeneratedVideo(resp);
						var qrCode: string = await this.libraryManager.generateQr(generatedVideo);

						var library: Library = new Library()
						library.url = generatedVideo
						library.qrcode = qrCode
						library.userId = req.userId

						var libraryVideo: Library = await this.libraryManager.create(library);

						res.status(200).send({ data: resp, tokens: tokens });



					})
					.catch(error => {

						console.log("error " + error)
						return res.status(402).send({ message: "You do not have enough tokens in d-id" });
					});


			})


		);


		this.router.post(
			'/stripe/customizedPayment',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {


					const storeItem = { priceInCents: 1790, name: "Hopguides tour" };
					var session = null;

					session = await stripe.checkout.sessions.create({
						payment_method_types: ["card"],
						mode: "payment",  // Changed to 'payment' for one-time payments
						line_items: [{
							price_data: {
								currency: "eur",
								product_data: {
									name: storeItem.name,
								},
								unit_amount: storeItem.priceInCents,
							},
							quantity: 1,
						}],
						metadata: {
							"tourId": req.body.tourId // Assuming req.body contains tourId
						},
						success_url: `https://hopguides-video-creation.netlify.app/#/success`,
						cancel_url: `https://hopguides-video-creation.netlify.app/#/failure`,
					});

					var tourVideo: TourVideo = await this.tourVideoManager.getTour(req.body.tourId);

					tourVideo.paymentLink = session.url;

					var tourVideoUpdated: TourVideo = await this.tourVideoManager.updateTour(tourVideo.id, tourVideo);

					res.status(200).send(session.url)

				} catch (e) {
					res.status(500).json({ error: e.message })
				}
			})
		);


		this.router.post(
			'/stripe/pay',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					const storeItems = new Map([
						[1, { priceInCents: 2999, name: "Basic plan monthly" }],
						[2, { priceInCents: 12900, name: "Premium plan monthly" }],
						[3, { priceInCents: 22800, name: "Base plan yearly" }],
						[4, { priceInCents: 118800, name: "Premium plan yearly" }],
						[5, { priceInCents: 9900, name: "Influencer package" }],
					])


					const storeItem = storeItems.get(req.body.id);
					var session = null
					if (req.body.id == 1 || req.body.id == 2) {
						session = await stripe.checkout.sessions.create({
							payment_method_types: ["card"],
							mode: "subscription",
							line_items: [{

								price_data: {
									currency: "eur",
									product_data: {
										name: storeItem.name,
									},
									unit_amount: storeItem.priceInCents,
									recurring: { interval: 'month' },  // You can also set it to 'year' for yearly plans
								},
								quantity: req.body.quantity,


							}],
							metadata: {
								"userId": req.userId
							},
							subscription_data: {
								"metadata": {
									"userId": req.userId
								}
							},
							//metadata: { userId: req.userId },
							success_url: `https://hopguides-video-creation.netlify.app/#/success`,
							cancel_url: `https://hopguides-video-creation.netlify.app/#/failure`,
						});
					} else if (req.body.id == 3 || req.body.id == 4) {
						session = await stripe.checkout.sessions.create({
							payment_method_types: ["card"],
							mode: "subscription",
							line_items: [{

								price_data: {
									currency: "eur",
									product_data: {
										name: storeItem.name,
									},
									unit_amount: storeItem.priceInCents,
									recurring: { interval: 'year' },  // You can also set it to 'year' for yearly plans
								},
								quantity: req.body.quantity,


							}],
							metadata: {
								"userId": req.userId
							},
							subscription_data: {
								"metadata": {
									"userId": req.userId
								}
							},
							success_url: `https://hopguides-video-creation.netlify.app/#/success`,
							cancel_url: `https://hopguides-video-creation.netlify.app/#/failure`,
						});
					} else {
						session = await stripe.checkout.sessions.create({
							payment_method_types: ["card"],
							mode: "payment",  // Changed to 'payment' for one-time payments
							line_items: [{
								price_data: {
									currency: "eur",
									product_data: {
										name: storeItem.name,
									},
									unit_amount: storeItem.priceInCents,
								},
								quantity: 1,
							}],
							metadata: {
								"userId": req.userId
								// Assuming req.body contains tourId
							},
							allow_promotion_codes: true,

							success_url: `https://hopguides-video-creation.netlify.app/#/success`,
							cancel_url: `https://hopguides-video-creation.netlify.app/#/failure`,
						});
					}
					res.json({ url: session.url });

				} catch (e) {
					res.status(500).json({ error: e.message })
				}
			})
		);



		this.router.post(
			'/videotour/create/:tourname',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					console.log(req.body)
					var user = await this.userManager.getUser(req.userId)

					var pois = []
					for (var poi of req.body) {
						var newPoi: POIVideo = new POIVideo()
						newPoi.text = poi
						pois.push(newPoi)

					}

					var tour: TourVideo = new TourVideo()
					tour.userId = user.id,
						tour.points = pois
					tour.title = req.params.tourname


					var tourVideo: TourVideo = await this.tourVideoManager.createTour(tour);

					console.log(tourVideo)
					res.status(200).send(tourVideo);
				} catch (e) {

					console.log(e)
					res.status(500).json({ error: e.message })
				}
			})
		);


		this.router.post(
			'/videotour/update',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					// Retrieve the existing tour video using the ID provided

					console.log(req.body)
					var tourVideo: TourVideo = await this.tourVideoManager.getTour(req.body.data.tour.id);

					// Identify the point to be updated

					// Update the point with new data
					tourVideo.points[req.body.data.chapter].text = req.body.data.words; // Update text field
					tourVideo.points[req.body.data.chapter].video = req.body.video; // Update text field
					// Update other fields as necessary...

					// Persist the updated tour video
					var tourVideoUpdated: TourVideo = await this.tourVideoManager.updateTour(tourVideo.id, tourVideo);

					var tourVideo: TourVideo = await this.tourVideoManager.getTour(req.body.data.tour.id);

					res.status(200).send(tourVideo);
				} catch (e) {
					console.log(e);
					res.status(500).json({ error: e.message });
				}
			})
		);



		this.router.post(
			'/videotour/ads',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					// Retrieve the existing tour video using the ID provided

					console.log(req.body)
					var tourVideo: TourVideo = await this.tourVideoManager.getTour(req.body.tour.id);

					// Identify the point to be updated

					// Update the point with new data

					tourVideo.ads = req.body.ads
					// Update other fields as necessary...

					// Persist the updated tour video
					var tourVideoUpdated: TourVideo = await this.tourVideoManager.updateTour(tourVideo.id, tourVideo);

					var tourVideo: TourVideo = await this.tourVideoManager.getTour(req.body.tour.id);

					res.status(200).send(tourVideo);
				} catch (e) {
					console.log(e);
					res.status(500).json({ error: e.message });
				}
			})
		);


		this.router.get(
			'/videotour/tourname/:tourname',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					// Retrieve the existing tour video using the ID provided

					console.log(req.body)
					var tourVideo: TourVideo = await this.tourVideoManager.getTour(req.body.data.tour.id);

					// Identify the point to be updated

					// Update the point with new data
					tourVideo.points[req.body.data.chapter].text = req.body.data.words; // Update text field
					tourVideo.points[req.body.data.chapter].video = req.body.video; // Update text field
					// Update other fields as necessary...

					// Persist the updated tour video
					var tourVideoUpdated: TourVideo = await this.tourVideoManager.updateTour(tourVideo.id, tourVideo);

					var tourVideo: TourVideo = await this.tourVideoManager.getTour(req.body.data.tour.id);

					res.status(200).send(tourVideo);
				} catch (e) {
					console.log(e);
					res.status(500).json({ error: e.message });
				}
			})
		);




		this.router.get(
			'/videotour/getAll',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					// Retrieve the existing tour video using the ID provided

					var tourVideos: TourVideo[] = await this.tourVideoManager.getTours(req.userId);

					// Identify the point to be updated

					res.status(200).send(tourVideos);
				} catch (e) {
					console.log(e);
					res.status(500).json({ error: e.message });
				}
			})
		);


	}





}




