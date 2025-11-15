import scrapeJobPosting from "../utils/web/scrapeJobPosting";

const testScrape = async () => {
  const res = await scrapeJobPosting(
    "https://www.indeed.com/l-boston,-ma-jobs.html?vjk=e91788f7798be90a"
  );
  console.log(res);
};

testScrape();
