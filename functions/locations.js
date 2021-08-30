const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
require("dotenv").config();

exports.handler = async function (event, context) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath:
      process.env.CHROME_EXCUTABLE_PATH || (await chromium.executablePath),
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(
    `https://www.health.govt.nz/our-work/diseases-and-conditions/covid-19-novel-coronavirus/covid-19-health-advice-public/contact-tracing-covid-19/covid-19-contact-tracing-locations-interest`
  );

  const locations = await page.evaluate(async () => {
    let tdiv = document.querySelector(".table-responsive");
    let locationsTable = tdiv.children[0].tBodies[0];
    let htmlCollection = locationsTable.children;
    let rowsArray = Array.from(htmlCollection);

    let mappedLocations = rowsArray.map((row) => {
      let name = rowsArray[0].childNodes[1].innerText;
      let address = row.childNodes[3].innerText;
      let day = row.childNodes[5].innerText;
      let times = row.childNodes[7].innerText;
      let action = row.childNodes[9].innerText;
      let updatedAt = row.childNodes[11].innerText;

      return { name, address, day, times, action, updatedAt };
    });

    return mappedLocations;
  });
  await browser.close();
  return {
    statusCode: 200,
    body: JSON.stringify(locations),
  };
};
