# 📸 FokaSEFbot

<div align="center">
  <a href="https://t.me/FokaSEFbot">
    <img src="assets/FokaSEFbot.png" alt="FokaSEFbot image" width="200" height="auto">
  </a>
</div>

## Table of Contents

- [About the project](#about-the-project)
  - [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Important Scripts](#important-scripts)
- [Disclaimer](#disclaimer)

## About the project

Rediscover your SEF2023 memories effortlessly. Relive the cherished moments of SEF2023 using your 6-Digit-Code here. Waiting are unforgettable experiences and captured memories to be relished

### Tech Stack

- **Programing Language:** Javascript
- **Environment:** NodeJS
- **Telegram library:** Telegraf
- **Storage:** Google drive, Google sheets

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

First, make sure that you have the following installed on your machine:

- Node.js (version 18 or later)

### Installation

1. Clone the repository to your local machine.
2. Run `npm install` in the project directory to install the necessary dependencies.
3. Set up your environment variable
   - TOKEN: Your telegram bot token, claim one from [BotFather](https://t.me/BotFather)
   - SPERADSHEETID: The google sheet id you find from the url of your sheet, watch [this](https://youtu.be/PFJNJQCU_lo) for more information
   - PARENT_FOLDER: The google drive folder id you want to make as a root for this project, watch [this](https://youtu.be/bkaQTLCBBeo) for more information
4. Get your credential for google drive api access, watch [this](https://youtu.be/bkaQTLCBBeo) for more information
5. Get your credential for google sheets api access, watch [this](https://youtu.be/PFJNJQCU_lo) for more information
6. Start your app by running `npm start` script from your terminal

### Important Scripts

```sh
npm start  # Start your app

```

## Disclaimer

This website and its associated codebase are open-source and are released under the [ISC License](https://opensource.org/licenses/ISC). You are free to use, modify, and distribute the code, design, and content of this bot for any purpose in compliance with the license.
