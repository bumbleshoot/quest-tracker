/**
 * Quest Tracker v1.0.10 (beta) by @bumbleshoot
 *
 * See GitHub page for info & setup instructions:
 * https://github.com/bumbleshoot/quest-tracker
 */

const USER_ID = "";
const API_TOKEN = "";
const WEB_APP_URL = "";

const QUEST_TRACKER_SPREADSHEET_URL = "";
const QUEST_TRACKER_SPREADSHEET_TAB_NAME = "Sheet1";

/*************************************\
 *  DO NOT EDIT ANYTHING BELOW HERE  *
\*************************************/

const PARAMS = {
  "headers": {
    "x-api-user": USER_ID, 
    "x-api-key": API_TOKEN,
    "x-client": "35c3fb6f-fb98-4bc3-b57a-ac01137d0847-QuestTracker"
  },
  "muteHttpExceptions": true
};
const GET_PARAMS = Object.assign({ "method": "get" }, PARAMS);
const POST_PARAMS = Object.assign({ "method": "post" }, PARAMS);
const DELETE_PARAMS = Object.assign({ "method": "delete" }, PARAMS);

const scriptProperties = PropertiesService.getScriptProperties();

function install() {

  // if settings are valid
  if (validateConstants()) {

    // delete triggers & webhook
    deleteTriggers();
    deleteWebhook();

    // update quest tracker
    updateQuestTracker();

    // create webhook
    createWebhook();

    console.log("Success!");
  }
}

function uninstall() {

  // delete triggers & webhook
  deleteTriggers();
  deleteWebhook();

  console.log("Done!");
}

function validateConstants() {

  let valid = true;

  if (typeof USER_ID !== "string" || USER_ID == "") {
    console.log("ERROR: USER_ID must equal your Habitica User ID.\n\neg. const USER_ID = \"abcd1234-ef56-gh78-ij90-abcdef123456\";\n\nYour Habitica User ID can be found at https://habitica.com/user/settings/api");
    valid = false;
  }

  if (typeof API_TOKEN !== "string" || API_TOKEN == "") {
    console.log("ERROR: API_TOKEN must equal your Habitica API Token.\n\neg. const API_TOKEN = \"abcd1234-ef56-gh78-ij90-abcdef123456\";\n\nYour Habitica API Token can be found at https://habitica.com/user/settings/api");
    valid = false;
  }

  if (valid) {
    try {
      let user = JSON.parse(fetch("https://habitica.com/api/v3/groups/party", GET_PARAMS)).data;
      if (user.leader.id !== USER_ID) {
        console.log("WARNING: Quest Tracker should only be run by one party member (preferably the party leader).");
      }
    } catch (e) {
      if (e.stack.includes("There is no account that uses those credentials")) {
        console.log("ERROR: Your USER_ID and/or API_TOKEN is incorrect. Both of these can be found at https://habitica.com/user/settings/api");
        valid = false;
      } else {
        throw e;
      }
    }
  }

  if (typeof WEB_APP_URL !== "string" || WEB_APP_URL == "") {
    console.log("ERROR: WEB_APP_URL must equal the web app url of this project's deployment.\n\neg. const WEB_APP_URL = \"https://script.google.com/macros/s/abc123def456ghi789jkl012abc345de/exec\";");
    valid = false;
  }

  if (typeof QUEST_TRACKER_SPREADSHEET_URL !== "string" || !QUEST_TRACKER_SPREADSHEET_URL.startsWith("https://docs.google.com/spreadsheets/d/") || QUEST_TRACKER_SPREADSHEET_URL.match(/[^\/]{44}/) === null) {
    console.log("ERROR: QUEST_TRACKER_SPREADSHEET_URL must equal the URL of the Google Sheet that contains the Quest Tracker tab. You can copy this URL from your address bar while viewing the spreadsheet in a web browser.\n\neg. const QUEST_TRACKER_SPREADSHEET_URL = \"https://docs.google.com/spreadsheets/d/1YbiVoNxP6q08KFPY01ARa3bNv8MDhBtRx41fBqPWN2o\";");
    valid = false;
  } else {
    try {
      var questTrackerSpreadsheet = SpreadsheetApp.openById(QUEST_TRACKER_SPREADSHEET_URL.match(/[^\/]{44}/)[0]);
    } catch (e) {
      if (e.stack.includes("Unexpected error while getting the method or property openById on object SpreadsheetApp")) {
        console.log("ERROR: QUEST_TRACKER_SPREADSHEET_URL not found: " + QUEST_TRACKER_SPREADSHEET_URL);
        valid = false;
      } else {
        throw e;
      }
    }
  }

  if (typeof QUEST_TRACKER_SPREADSHEET_TAB_NAME !== "string" || QUEST_TRACKER_SPREADSHEET_TAB_NAME == "") {
    console.log("ERROR: QUEST_TRACKER_SPREADSHEET_TAB_NAME must equal the name of the Quest Tracker tab.\n\neg. const QUEST_TRACKER_SPREADSHEET_TAB_NAME = \"Quest Tracker\";");
    valid = false;
  } else if (typeof questTrackerSpreadsheet !== "undefined" && questTrackerSpreadsheet.getSheetByName(QUEST_TRACKER_SPREADSHEET_TAB_NAME) === null) {
    console.log("ERROR: QUEST_TRACKER_SPREADSHEET_TAB_NAME \"" + QUEST_TRACKER_SPREADSHEET_TAB_NAME + "\" doesn't exist.");
    valid = false;
  }

  if (!valid) {
    console.log("Please fix the above errors, create a new version of the existing deployment (or create a new deployment if you haven't created one already), then run the install function again.");
  }

  return valid;
}

function deleteTriggers() {
  let triggers = ScriptApp.getProjectTriggers();
  if (triggers.length > 0) {

    console.log("Deleting triggers");

    for (let trigger of triggers) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function deleteWebhook() {
  let webhooks = JSON.parse(fetch("https://habitica.com/api/v3/user/webhook", GET_PARAMS)).data;
  if (webhooks.length > 0) {

    console.log("Deleting webhook");

    for (let webhook of webhooks) {
      if (webhook.url == WEB_APP_URL) {
        fetch("https://habitica.com/api/v3/user/webhook/" + webhook.id, DELETE_PARAMS);
      }
    }
  }
}

function createWebhook() {

  console.log("Creating webhook");

  let webhook = {
    "url": WEB_APP_URL,
    "label": DriveApp.getFileById(ScriptApp.getScriptId()).getName(),
    "type": "questActivity",
    "options": {
      "questFinished": true
    }
  };

  webhook = Object.assign({
    "contentType": "application/json",
    "payload": JSON.stringify(webhook)
  }, POST_PARAMS);

  fetch("https://habitica.com/api/v3/user/webhook", webhook);
}

/**
 * doPost(e)
 * 
 * This function is called by webhooks.
 */
 function doPost(e) {
  try {

    // create temporary trigger to update the quest tracker
    let triggerNeeded = true;
    for (let trigger of ScriptApp.getProjectTriggers()) {
      if (trigger.getHandlerFunction() === "processTrigger") {
        triggerNeeded = false;
        break;
      }
    }
    if (triggerNeeded) {
      ScriptApp.newTrigger("processTrigger")
        .timeBased()
        .after(1)
        .create();
    }

  } catch (e) {
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      DriveApp.getFileById(ScriptApp.getScriptId()).getName() + " failed!",
      e.stack
    );
    throw e;
  }
}

/**
 * processTrigger()
 * 
 * Deletes temporary triggers, calls the updateQuestTracker() 
 * function, and emails the user if any errors are thrown.
 */
function processTrigger() {
  try {

    // delete temporary triggers
    for (let trigger of ScriptApp.getProjectTriggers()) {
      ScriptApp.deleteTrigger(trigger);
    }

    // update quest tracker
    updateQuestTracker();

  } catch (e) {
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      DriveApp.getFileById(ScriptApp.getScriptId()).getName() + " failed!",
      e.stack
    );
    throw e;
  }
}

/**
 * fetch(url, params)
 * 
 * Wrapper for Google Apps Script's UrlFetchApp.fetch(url, params):
 * https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params
 * 
 * Retries failed API calls up to 2 times, retries for up to 1 min if 
 * Habitica's servers are down, & handles Habitica's rate limiting.
 */
 function fetch(url, params) {

  // try up to 3 times
  for (let i=0; i<3; i++) {

    // if rate limit reached
    let properties = scriptProperties.getProperties();
    let rateLimitRemaining = properties["X-RateLimit-Remaining"];
    let rateLimitReset = properties["X-RateLimit-Reset"];
    if (rateLimitRemaining != null && Number(rateLimitRemaining) < 1) {

      // wait until rate limit reset
      let waitUntil = new Date(rateLimitReset);
      waitUntil.setSeconds(waitUntil.getSeconds() + 1);
      let now = new Date();
      Utilities.sleep(Math.max(waitUntil.getTime() - now.getTime(), 0));
    }

    // call API
    let response;
    let addressUnavailable = 0;
    while (true) {
      try {
        response = UrlFetchApp.fetch(url, params);
        break;

      // if address unavailable, wait 5 seconds & try again
      } catch (e) {
        if (addressUnavailable < 12 && e.stack.includes("Address unavailable")) {
          addressUnavailable++;
          Utilities.sleep(5000);
        } else {
          throw e;
        }
      }
    }

    // store rate limiting data
    scriptProperties.setProperties({
      "X-RateLimit-Reset": response.getHeaders()["x-ratelimit-reset"],
      "X-RateLimit-Remaining": response.getHeaders()["x-ratelimit-remaining"]
    });

    // if success, return response
    if (response.getResponseCode() < 300 || (response.getResponseCode() === 404 && (url === "https://habitica.com/api/v3/groups/party" || url.startsWith("https://habitica.com/api/v3/groups/party/members")))) {
      return response;

    // if rate limited due to running multiple scripts, try again
    } else if (response.getResponseCode() === 429) {
      i--;

    // if 3xx or 4xx or failed 3 times, throw exception
    } else if (response.getResponseCode() < 500 || i >= 2) {
      throw new Error("Request failed for https://habitica.com returned code " + response.getResponseCode() + ". Truncated server response: " + response.getContentText());
    }
  }
}

/**
 * getQuestData()
 * 
 * Gathers relevant quest data from Habitica's API, arranges it
 * in a JavaScript Object, and returns the object.
 */
 function getQuestData() {

  console.log("Getting quest data");

  // sort party members by username
  members.sort((a, b) => {
    return a.auth.local.username.localeCompare(b.auth.local.username);
  })

  // get # each egg & hatching potion owned/used for each member
  for (let member of members) {
    member.numEachEggOwnedUsed = member.items.eggs;
    member.numEachPotionOwnedUsed = member.items.hatchingPotions;
    for (let [pet, amount] of Object.entries(member.items.pets)) {
      if (amount > 0) { // 5 = newly hatched pet, >5 = fed pet, -1 = mount but no pet
        pet = pet.split("-");
        let species = pet[0];
        let color = pet[1];
        if (member.numEachEggOwnedUsed.hasOwnProperty(species)) {
          member.numEachEggOwnedUsed[species] = member.numEachEggOwnedUsed[species] + 1;
        } else {
          member.numEachEggOwnedUsed[species] = 1;
        }
        if (member.numEachPotionOwnedUsed.hasOwnProperty(color)) {
          member.numEachPotionOwnedUsed[color] = member.numEachPotionOwnedUsed[color] + 1;
        } else {
          member.numEachPotionOwnedUsed[color] = 1;
        }
      }
    }
    for (let mount of Object.keys(member.items.mounts)) {
      mount = mount.split("-");
      let species = mount[0];
      let color = mount[1];
      if (member.numEachEggOwnedUsed.hasOwnProperty(species)) {
        member.numEachEggOwnedUsed[species] = member.numEachEggOwnedUsed[species] + 1;
      } else {
        member.numEachEggOwnedUsed[species] = 1;
      }
      if (member.numEachPotionOwnedUsed.hasOwnProperty(color)) {
        member.numEachPotionOwnedUsed[color] = member.numEachPotionOwnedUsed[color] + 1;
      } else {
        member.numEachPotionOwnedUsed[color] = 1;
      }
    }
  }

  // get lists of premium eggs, premium hatching potions & wacky hatching potions
  let premiumEggs = [];
  for (let egg of Object.values(content.questEggs)) {
    premiumEggs.push(egg.key);
  }
  let premiumHatchingPotions = [];
  for (let potion of Object.values(content.premiumHatchingPotions)) {
    premiumHatchingPotions.push(potion.key);
  }
  let wackyHatchingPotions = [];
  for (let potion of Object.values(content.wackyHatchingPotions)) {
    wackyHatchingPotions.push(potion.key);
  }

  // create quest lists
  let eggQuests = [];
  let hatchingPotionQuests = [];
  let petQuests = [];
  let masterclasserQuests = [];
  let unlockableQuests = [];
  let achievementQuests = [];

  // for each quest
  for (let quest of Object.values(content.quests)) {

    // if world boss, skip it
    if (quest.category == "world") {
      continue;
    }

    // get rewards
    let rewards = [];
    if (typeof quest.drop.items !== "undefined") {

      for (let drop of quest.drop.items) {

        let rewardName = drop.text;
        let rewardType = "";

        if (drop.type == "eggs" && premiumEggs.includes(drop.key)) {
          rewardName = content.eggs[drop.key].text + " Egg";
          rewardType = "egg";
        } else if (drop.type == "hatchingPotions" && premiumHatchingPotions.includes(drop.key)) {
          rewardType = "hatchingPotion";
        } else if (drop.type == "hatchingPotions" && wackyHatchingPotions.includes(drop.key)) {
          rewardType = "wackyPotion";
        } else if (drop.type == "mounts") {
          rewardType = "mount";
        } else if (drop.type == "pets") {
          rewardType = "pet";
        } else if (drop.type == "gear") {
          rewardType = "gear";
        }

        if (rewardType != "") {
          let index = rewards.findIndex(reward => reward.name == rewardName);
          if (index == -1) {
            rewards.push({
              key: drop.key,
              name: rewardName,
              type: rewardType,
              qty: 1
            });
          } else {
            rewards[index].qty++;
          }
        }
      }
    }

    // get completions needed & completions (individual)
    let neededIndividual;
    let completedIndividual = {};
    if (rewards.length > 0 && rewards[0].type == "egg") {
      neededIndividual = 20 / rewards[0].qty;
      for (let member of members) {
        if (typeof member.numEachEggOwnedUsed[rewards[0].key] === "undefined") {
          member.numEachEggOwnedUsed[rewards[0].key] = 0;
        }
        let timesCompleted = Math.min(member.numEachEggOwnedUsed[rewards[0].key] / rewards[0].qty, neededIndividual);
        completedIndividual[member.auth.local.username] = Math.floor(Math.ceil(neededIndividual) * timesCompleted / neededIndividual);
      }
    } else if (rewards.length > 0 && (rewards[0].type == "hatchingPotion" || rewards[0].type == "wackyPotion")) {
      if (rewards[0].type == "hatchingPotion") {
        neededIndividual = 18 / rewards[0].qty;
      } else {
        neededIndividual = 9 / rewards[0].qty;
      }
      for (let member of members) {
        if (typeof member.numEachPotionOwnedUsed[rewards[0].key] === "undefined") {
          member.numEachPotionOwnedUsed[rewards[0].key] = 0;
        }
        let timesCompleted = Math.min(member.numEachPotionOwnedUsed[rewards[0].key] / rewards[0].qty, neededIndividual);
        completedIndividual[member.auth.local.username] = Math.floor(Math.ceil(neededIndividual) * timesCompleted / neededIndividual);
      }
    } else {
      neededIndividual = 1;
      for (let member of members) {
        let timesCompleted = 0;
        for (let [questKey, completions] of Object.entries(member.achievements.quests)) {
          if (questKey == quest.key) {
            timesCompleted = Math.min(completions, neededIndividual);
            break;
          }
        }
        completedIndividual[member.auth.local.username] = timesCompleted;
      }
    }
    neededIndividual = Math.ceil(neededIndividual);

    // create quest object
    let questInfo = {
      name: quest.text,
      rewards,
      neededIndividual,
      completedIndividual
    };

    // add quest to corresponding quest list
    let rewardType = rewards.length > 0 ? rewards[0].type : null;
    if (quest.group == "questGroupDilatoryDistress" || quest.group == "questGroupTaskwoodsTerror" || quest.group == "questGroupStoikalmCalamity" || quest.group == "questGroupMayhemMistiflying" || quest.group == "questGroupLostMasterclasser") {
      masterclasserQuests.push(questInfo);
    } else if (quest.text == "The Basi-List" || quest.text == "The Feral Dust Bunnies") {
      achievementQuests.push(questInfo);
    } else if (quest.category == "unlockable") {
      unlockableQuests.push(questInfo);
    } else if (rewardType == "egg") {
      eggQuests.push(questInfo);
    } else if (["hatchingPotion", "wackyPotion"].includes(rewardType)) {
      hatchingPotionQuests.push(questInfo);
    } else if (rewardType == "pet" || rewardType == "mount") {
      petQuests.push(questInfo);
    }
  }

  // compare each pair of egg quests
  for (let i=0; i<eggQuests.length; i++) {
    for (let j=i+1; j<eggQuests.length; j++) {

      // if rewards are the same
      if (eggQuests[i].rewards.map(x => JSON.stringify(x)).sort((a, b) => a.localeCompare(b)).join(",") === eggQuests[j].rewards.map(x => JSON.stringify(x)).sort((a, b) => a.localeCompare(b)).join(",")) {

        // combine quest data & save to quest list
        eggQuests.push({
          name: eggQuests[i].name + " OR " + eggQuests[j].name,
          rewards: eggQuests[i].rewards,
          neededIndividual: eggQuests[i].neededIndividual,
          completedIndividual: eggQuests[i].completedIndividual
        });

        // delete individual quests
        eggQuests.splice(j, 1);
        eggQuests.splice(i, 1);
        j = i;
      }
    }
  }

  // return quest lists
  return {
    eggQuests,
    hatchingPotionQuests,
    petQuests,
    masterclasserQuests,
    unlockableQuests,
    achievementQuests
  };
}

/**
 * updateQuestTracker()
 * 
 * Updates the Quest Tracker spreadsheet, which shows how many 
 * quest completions are needed by each party member for every 
 * quest in Habitica. Also shows total quest completion 
 * percentages for each party member and quest.
 * 
 * Run this function on the questFinished webhook.
 */
let members;
let content;
function updateQuestTracker() {

  // open spreadsheet & sheet
  try {
    var spreadsheet = SpreadsheetApp.openById(QUEST_TRACKER_SPREADSHEET_URL.match(/[^\/]{44}/)[0]);
    var sheet = spreadsheet.getSheetByName(QUEST_TRACKER_SPREADSHEET_TAB_NAME);

    // if sheet doesn't exist, print error & exit
    if (sheet === null) {
      console.log("ERROR: QUEST_TRACKER_SPREADSHEET_TAB_NAME \"" + QUEST_TRACKER_SPREADSHEET_TAB_NAME + "\" doesn't exit.");
      return;
    }

  // if spreadsheet doesn't exist, print error & exit
  } catch (e) {
    if (e.stack.includes("Unexpected error while getting the method or property openById on object SpreadsheetApp")) {
      console.log("ERROR: QUEST_TRACKER_SPREADSHEET_URL not found: " + QUEST_TRACKER_SPREADSHEET_URL);
      return;
    } else {
      throw e;
    }
  }

  // get API data
  members = JSON.parse(fetch("https://habitica.com/api/v3/groups/party/members?includeAllPublicFields=true", GET_PARAMS)).data;
  if (typeof members === "undefined") {
    members = [JSON.parse(fetch("https://habitica.com/api/v3/user", GET_PARAMS)).data];
  }
  content = JSON.parse(fetch("https://habitica.com/api/v3/content", GET_PARAMS)).data;

  // get quest data
  let questData = getQuestData();

  // sort egg, hatching potion, & pet quests alphabetically by reward name
  questData.eggQuests.sort((a, b) => {
    return a.rewards[0].name.localeCompare(b.rewards[0].name);
  });
  questData.hatchingPotionQuests.sort((a, b) => {
    return a.rewards[0].name.localeCompare(b.rewards[0].name);
  });
  questData.petQuests.sort((a, b) => {
    return a.rewards[0].name.localeCompare(b.rewards[0].name);
  });

  // combine quests into one list
  let quests = questData.eggQuests.concat(questData.hatchingPotionQuests).concat(questData.petQuests).concat(questData.masterclasserQuests).concat(questData.unlockableQuests).concat(questData.achievementQuests);

  console.log("Updating Quest Tracker");

  // clear sheet
  let generatedContent = sheet.getRange(2, 1, 999, Math.max(sheet.getLastColumn(), 1));
  generatedContent.clearContent().setBackground(null).breakApart();

  // get list of usernames
  let usernames = Object.keys(quests[0].completedIndividual);

  // sort usernames alphabetically
  usernames.sort((a, b) => {
    return a.localeCompare(b);
  });

  // print headings (usernames and TOTAL)
  sheet.getRange(2, 3, 1, usernames.length+1).setValues([["TOTAL"].concat(usernames)]).setHorizontalAlignment("center").setFontWeight("bold");

  // print categories
  let firstEmptyRow = 3;
  let color1 = "#ffffff";
  let color2 = "#ebf4ff";
  sheet.getRange(firstEmptyRow, 1, quests.length).setTextRotation(90).setVerticalAlignment("middle").setFontWeight("bold");
  sheet.getRange(firstEmptyRow, 1, questData.eggQuests.length, 2).setBackground(color1).offset(0, 0, questData.eggQuests.length, 1).merge().setValue("Eggs");
  firstEmptyRow += questData.eggQuests.length;
  sheet.getRange(firstEmptyRow, 1, questData.hatchingPotionQuests.length, 2).setBackground(color2).offset(0, 0, questData.hatchingPotionQuests.length, 1).merge().setValue("Hatching Potions");
  firstEmptyRow += questData.hatchingPotionQuests.length;
  sheet.getRange(firstEmptyRow, 1, questData.petQuests.length, 2).setBackground(color1).offset(0, 0, questData.petQuests.length, 1).merge().setValue("Pets");
  firstEmptyRow += questData.petQuests.length;
  sheet.getRange(firstEmptyRow, 1, questData.masterclasserQuests.length, 2).setBackground(color2).offset(0, 0, questData.masterclasserQuests.length, 1).merge().setValue("Masterclasser");
  firstEmptyRow += questData.masterclasserQuests.length;
  sheet.getRange(firstEmptyRow, 1, questData.unlockableQuests.length, 2).setBackground(color1).offset(0, 0, questData.unlockableQuests.length, 1).merge().setValue("Unlockable");
  firstEmptyRow += questData.unlockableQuests.length;
  sheet.getRange(firstEmptyRow, 1, questData.achievementQuests.length, 2).setBackground(color2).offset(0, 0, questData.achievementQuests.length, 1).merge().setValue("Other");

  // misc formatting
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(2);
  sheet.getRange(3, 2, sheet.getLastRow(), 1).setHorizontalAlignment("right").setFontWeight("bold");

  // create array for TOTAL row
  let totals = new Array(usernames.length).fill(0);

  // for each quest
  let sumUsersPercentComplete = 0;
  for (let i=0; i<quests.length; i++) {

    // print quest reward or name
    let reward = quests[i].rewards[0];
    if (i < questData.eggQuests.length) {
      sheet.getRange(i+3, 2).setValue(reward.name.substring(0, reward.name.length - 4));
    } else if (i < questData.eggQuests.length + questData.hatchingPotionQuests.length) {
      sheet.getRange(i+3, 2).setValue(reward.name.substring(0, reward.name.length - 16));
    } else if (i < questData.eggQuests.length + questData.hatchingPotionQuests.length + questData.petQuests.length) {
      sheet.getRange(i+3, 2).setValue(reward.name);
    } else {
      sheet.getRange(i+3, 2).setValue(quests[i].name.split(":")[0].replace(/^The /, "").replace(", Part", ""));
    }

    // get completions for each member
    let completedIndividual = Object.entries(quests[i].completedIndividual);

    // sort completions by username
    completedIndividual.sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

    // for each member
    let totalQuestCompletions = 0;
    let totalQuestCompletionsNeeded = 0;
    for (let j=0; j<completedIndividual.length; j++) {

      // print completions/completions needed
      let numCompletions = completedIndividual[j][1];
      let completionsNeeded = quests[i].neededIndividual;
      let cell = sheet.getRange(i+3, j+4);
      cell.setValue(numCompletions + "/" + completionsNeeded).setHorizontalAlignment("center").setFontStyle("normal");
      if (numCompletions >= completionsNeeded) {
        cell.setBackground("#b6d7a8");
      } else if (numCompletions >= 1) {
        cell.setBackground("#ffe599");
      } else {
        cell.setBackground("#ea9999");
      }

      // add completions for TOTAL column
      totalQuestCompletions += numCompletions;
      totalQuestCompletionsNeeded += completionsNeeded;

      // add percentage to TOTAL row
      totals[j] += numCompletions / completionsNeeded;
      if (i == quests.length-1) {
        let userPercentComplete = totals[j] / quests.length * 100;
        totals[j] = Math.floor(userPercentComplete) + "%";
        sumUsersPercentComplete += userPercentComplete;
      }
    }

    // print TOTAL column
    sheet.getRange(i+3, 3).setValue(Math.floor(totalQuestCompletions / totalQuestCompletionsNeeded * 100) + "%").setHorizontalAlignment("center").setFontStyle("normal");
  }

  // print TOTAL row
  sheet.getRange(sheet.getLastRow()+1, 2).setValue("TOTAL");
  sheet.getRange(sheet.getLastRow(), 3).setValue(Math.floor(sumUsersPercentComplete / usernames.length) + "%").setHorizontalAlignment("center").setFontStyle("normal");
  sheet.getRange(sheet.getLastRow(), 4, 1, totals.length).setValues([totals]).setHorizontalAlignment("center").setFontStyle("normal");

  // print last updated
  sheet.getRange(sheet.getLastRow()+2, 3, 1, 1).setHorizontalAlignment("left").setFontStyle("italic").setValues([["Last updated: " + new Date().toUTCString()]]);
}