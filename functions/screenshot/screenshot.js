/* Take Screenshot with Puppeteer *********************** */

const chromium = require('chrome-aws-lambda');

const takeScreenshot = async (feature, periods, accessibleColours) => {

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
        width: 1000,
        height: 700,
        isLandscape: true
    },
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

	const page = await browser.newPage();

	await page.goto(
		`https://caniuse.bitsofco.de/embed/index.html?feat=${feature}&periods=${periods}&accessible-colours=${accessibleColours}&screenshot=true`,
		{ waitUntil: 'networkidle2' }
	);

	const screenshot = await page.screenshot({
		omitBackground: true,
		encoding: 'binary'
	});

	await browser.close();

	return screenshot;
};


/* Trim Screenshot *********************** */

const fetch = require('node-fetch');
const FormData = require('form-data');

const trimScreenshot = (screenshot) => {

	const formData = new FormData();
	formData.append("image", screenshot, { filename : 'image.png' });

	const options = {
		method: "POST",
		body: formData
	};

	return new Promise((resolve) => {
		fetch("http://localhost:3000/trim", options) // @todo: replace with https://caniuse-embed-screenshot-api.herokuapp.com
			.then((res) => res.blob())
			// .then((res) => res.arrayBuffer())
			.then((res) => {
				console.log("**********************************")
				console.log(res);
				console.log("screenshot successfully trimmed");
				console.log("**********************************")
				resolve(res);
			})
			.catch((err) => {
				console.log("error trimming screenshot");
				console.log(err);
				resolve(screenshot);
			});
	});
};


/* Upload Screenshot with Cloudinary *********************** */

const cloudinary = require('cloudinary').v2;
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadScreenshot = (feature, screenshot) => {
	return new Promise((resolve, reject) => {

		const today = new Date();
		const dd = today.getDate();
		const mm = today.getMonth() + 1;
		const yyyy = today.getFullYear();
		const date = `${yyyy}-${mm}-${dd}`;

		const options = {
			folder: 'caniuse-embed/static',
			public_id: `${feature}-${date}`
		};

		cloudinary.uploader.upload_stream(options, (error, result) => {
			if (error) reject(error)
			else resolve(result);
		}).end(screenshot);
	});
}


/* Netlify Function *********************** */

exports.handler = async (event) => {

	const params = JSON.parse(event.body);
	if (!params.feature) return { statusCode: 400, body: "Feature required" };
	if (!params.periods) return { statusCode: 400, body: "Periods required" };

	const feature = params.feature;
	const periods = params.periods;
	const accessibleColours = params.accessibleColours || false;

	try {
		const screenshot = await takeScreenshot(feature, periods, accessibleColours);
		const trimmedScreenshot = await trimScreenshot(screenshot);
		const image = await uploadScreenshot(feature, trimmedScreenshot);
		return { statusCode: 200, body: JSON.stringify(image) };
	} catch (err) {
		console.log(err);
		return { statusCode: 500, body: err.toString() }
	}
  
};
