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

  await page.exposeFunction("mapLocations", async (htmlCollection) => {
    htmlCollection.forEach((row, i) => {
      let locationsOfIntrest = [];
      let locationName = row[0].innerText;
      let locationDetails = {
        place: locationName,
      };

      locationsOfIntrest = [...locationsOfIntrest, locationDetails];
    });
    return locationsOfIntrest;
  });

  const locations = await page.evaluate(async () => {
    const tdiv = document.querySelector(".table-responsive");
    const locationsTable = tdiv.children[0].tBodies[0];
    const htmlCollection = locationsTable.children;

    const row = htmlCollection.item(0);
    const rowPlaceCell = row.children[0];
    const rowPlaceCellText = rowPlaceCell.innerText;

    return rowPlaceCellText;
  });
  await browser.close();
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "Ok",
      locations,
    }),
  };
};
