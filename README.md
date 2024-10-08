## Summary
Automatically updates a [Google Sheet](https://www.google.ca/sheets/about/) in the player's [Google Drive](https://drive.google.com/) whenever the player's [party](https://habitica.fandom.com/wiki/Party) completes a [quest](https://habitica.fandom.com/wiki/Quests). The spreadsheet shows how many quest completions are needed by each party member for every quest in Habitica, in order to get all the rewards. Also shows total quest completion percentages for each party member and quest. The spreadsheet can be shared with the player's party, so only one party member needs to run this automation (preferably the party leader).

[<img title="Quest Tracker spreadsheet" src="https://github.com/bumbleshoot/quest-tracker/blob/main/quest-tracker.png?raw=true" width="250">](https://github.com/bumbleshoot/quest-tracker/blob/main/quest-tracker.png?raw=true)

## Setup Instructions
It is highly recommended that you use a desktop computer for this, as some of the steps don't work well on mobile.
1. Click [here](https://script.google.com/home/projects/1l7WWIuc0V0e1He3Nr3rByrO8HqoXqUUk0HA3bi7oMyDoyLra892fo6vr/) to go to the Quest Tracker script. If you're not signed into your Google account, click on "Start Scripting", then sign in, then click on the script link again.
2. Click the "Make a copy" button (looks like two pages of paper).
3. At the top of your screen, click on "Copy of Quest Tracker". Rename it "Quest Tracker" and click the "Rename" button.
4. Click [here](https://habitica.com/user/settings/api) to open your API Settings. Highlight and copy your User ID (it looks something like this: `35c3fb6f-fb98-4bc3-b57a-ac01137d0847`). In the Quest Tracker script, paste your User ID between the quotations where it says `const USER_ID = "";`. It should now look something like this: `const USER_ID = "35c3fb6f-fb98-4bc3-b57a-ac01137d0847";`
5. On the same page where you copied your User ID, click the "Show API Token" button, and copy your API Token. In the Quest Tracker script, paste your API Token between the quotations where it says `const API_TOKEN = "";`. It should now look something like this: `const API_TOKEN = "35c3fb6f-fb98-4bc3-b57a-ac01137d0847";`
6. [Create a new Google Sheet](https://sheets.google.com/create) and name it something like "[Party Name] Quest Tracker". Click the "Share" button near the top right corner of the page (looks like a little person). Click the dropdown under "General access", and select "Anyone with the link". Then click the "Copy link" button.
7. Skip the line that says `const WEB_APP_URL = "";`. We will come back to that later. Paste the spreadsheet URL inside the quotations where it says `const QUEST_TRACKER_SPREADSHEET_URL = "";`. If you've changed the tab name for the sheet you want to print the Quest Tracker to, paste the tab name inside the quotes where it says `const QUEST_TRACKER_SPREADSHEET_TAB_NAME = "";`.
8. Click the "Save project" button near the top of the page (looks like a floppy disk).
9. Click the blue "Deploy" button near the top of the page, then click "New deployment", then click the "Deploy" button.
10. (If this is your first time deploying) Click the "Review permissions" button and select your Google account. Click on "Advanced", then "Go to Quest Tracker (unsafe)". (Don't worry, it is safe!) Then click "Continue", then "Allow".
11. Under "Web app", click the "Copy" button to copy the Web App URL. Then click the "Done" button.
12. Paste your Web App URL inside the quotations where it says `const WEB_APP_URL = "";`.
13. Click the drop-down menu to the right of the "Debug" button, near the top of the page. Select "install" from the drop-down.
14. Click the "Run" button to the left of the "Debug" button. Wait for it to say "Execution completed".
15. You can now [update your party's description](https://habitica.fandom.com/wiki/Party#Customizing_a_Party) to [include a link](https://habitica.fandom.com/wiki/Markdown_Cheat_Sheet#Links,_Images_and_Emoji) to the Quest Tracker spreadsheet. You can also put anything you want in row 1 of the spreadsheet, and it will not be overwritten by the script.

You're all done! If you need to change the settings or uninstall the script at some point, follow the steps below.

## Changing the Settings
It is highly recommended that you use a desktop computer for this, as some of the steps don't work well on mobile.
1. [Click here](https://script.google.com/home) to see a list of your scripts. If you're not already signed into your Google account, click the "Start Scripting" button and sign in. Then click on "My Projects" in the main menu on the left.
2. Click on "Quest Tracker".
3. Edit the settings (`const`s) to your liking.
4. Click the "Save project" button near the top of the page (looks like a floppy disk).
5. Click the blue "Deploy" button near the top of the page, then click "Manage deployments".
6. Click the "Edit" button (looks like a pencil). Under "Version", select "New version".
7. Click the "Deploy" button, then the "Done" button.

## Uninstalling the Script
It is highly recommended that you use a desktop computer for this, as some of the steps don't work well on mobile.
1. [Click here](https://script.google.com/home) to see a list of your scripts. If you're not already signed into your Google account, click the "Start Scripting" button and sign in. Then click on "My Projects" in the main menu on the left.
2. Click on "Quest Tracker".
3. Click the drop-down menu to the right of the "Debug" button, near the top of the page. Select "uninstall" from the drop-down.
4. Click the "Run" button to the left of the "Debug" button. Wait for it to say "Execution completed".
5. Click the blue "Deploy" button near the top of the page, then click "Manage deployments".
6. Click the "Archive" button (looks like a box with a down arrow inside). Then click the "Done" button.

## Updating the Script
It is highly recommended that you use a desktop computer for this, as some of the steps don't work well on mobile.
1. Follow the steps in [Uninstalling the Script](#uninstalling-the-script) above.
2. Copy & paste your settings (`const`s) into a text editor so you can reference them while setting up the new version.
3. In the main menu on the left, click on "Overview" (looks like a lowercase letter i inside a circle).
4. Click the "Remove project" button (looks like a trash can).
5. Follow the [Setup Instructions](#setup-instructions) above. You don't have to make a new Quest Tracker spreadsheet, just use your existing one.

## Contact
❔ Questions: [https://github.com/bumbleshoot/quest-tracker/discussions/categories/q-a](https://github.com/bumbleshoot/quest-tracker/discussions/categories/q-a)  
💡 Suggestions: [https://github.com/bumbleshoot/quest-tracker/discussions/categories/suggestions](https://github.com/bumbleshoot/quest-tracker/discussions/categories/suggestions)  
🐞 Report a bug: [https://github.com/bumbleshoot/quest-tracker/issues](https://github.com/bumbleshoot/quest-tracker/issues)  
💗 Donate: [https://github.com/sponsors/bumbleshoot](https://github.com/sponsors/bumbleshoot)