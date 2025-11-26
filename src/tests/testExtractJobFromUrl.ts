import { extractJobFromUrl } from "../utils/web/extractJobFromUrl";

(async () => {
  const url = "https://www.linkedin.com/jobs/view/4334162346/";
  const title = "Software Developer- Cloud";
  const company = "Concero";

  const result = await extractJobFromUrl(url, title, company);
  console.log(result);
})();
