const yargs = require('yargs/yargs');
const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;
const course_slug = argv.slug;
const course_id = argv.id;
const since = argv.since ? new Date(argv.since) : new Date(0);
const course_dir = `${course_slug}-${course_id}`

fs.ensureDir(course_dir)


const orgURL = `https://discourse.onlinedegree.iitm.ac.in/c/courses/${course_slug}/${course_id}.json`
const topicURL = "https://discourse.onlinedegree.iitm.ac.in/t/"
let pageno = -1


async function getJSON(page, url, log = false) {
  await page.goto(url, {waitUntil: 'networkidle2'})
  let content = await page.evaluate(() => document.body.innerText)
  if (log) console.log(content)
  return JSON.parse(content)
}


async function getTopicList(browser) {
  let topicList = []
  let page = await browser.newPage()
  while (true) {
    pageno++;
    let params = new URLSearchParams({page: pageno})
    let url = `${orgURL}?${params.toString()}`
    let pageData = await getJSON(page, url);
    if (pageData.topic_list.topics.length == 0) {
      break
    }
    let topics = pageData.topic_list.topics.filter(k => new Date(k.created_at) >= since)
    if (topics.length == 0) break;
    topicList.push(...topics.map(k => k.id))
    console.log("Page no: ", pageno, " # topics: ", topicList.length)
  }
  return topicList
}

async function getTopicPost(page, topic_id) {
  let url = `${topicURL}${topic_id}.json`
  let topicData = await getJSON(page, url)
  return  {
    id: topic_id,
    timestamp: topicData.created_at,
    title: topicData.title,
    body: topicData.post_stream.posts[0].cooked,
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

puppeteer.launch({headless: true, userDataDir: "BROWSER_DATA"}).then(async (browser) => {
  let topics;
  if (await fs.pathExists(`${course_dir}/topics.json`)) {
    topics = await fs.readJson(`${course_dir}/topics.json`)
  } else {
    topics = []
  }
  if (topics.length == 0) {
    console.log("Getting topics...")
    topics = await getTopicList(browser)
    fs.writeJson(`${course_dir}/topics.json`, topics, {spaces: 2})
  }
  console.log("Getting posts...")
  let page = await browser.newPage()

  for (const topic_id of topics) {
    let posts = await getTopicPost(page, topic_id);
    await fs.writeJson(`${course_dir}/${topic_id}.json`, posts, { spaces: 2 });
    await delay(1000);
  }

  await browser.close()
})
