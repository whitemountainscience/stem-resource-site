# WMSI STEM Resource Site

Documentation for the [STEM Resource Site](https://whitemountainscience.org/stem-resource-site) page and ongoing development efforts. Starting in August 2024 the focus of this project is to make the backend more accessible with Google Sheets API, manage content (mostly images) through an affordable CDN like Google Cloud Console, refactor code and improve version control through Git.



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#organization">Organization</a></li>
    <li><a href="#resources">Resources</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This page is designed as a resource for educators to easily find activities for teaching STEM subjects. Some objectives of the project are:
- Educators can easily find STEM activities on the [WMSI site page](https://whitemountainscience.org/stem-resource-site) by searching and filtering a curated list.
- WMSI staff can easily maintain the list of activities and their properties in a Google Sheet, and store an image for each activity in Google Cloud Storage
- Educators external to WMSI can add activites to the sheet and potentially comment or like the activities that they find most useful (comments and likes not yet implemented)
- This repo can be modified by WMSI staff and potentially external contributors to improve the page

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [Google Cloud Platform](https://console.cloud.google.com/welcome?project=resource-table) for storing and serving up images
* [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts) to allow for easy storage / editing of activities in a [Google Sheet](https://docs.google.com/spreadsheets/d/1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I)
* [Featherlight](https://noelboss.github.io/featherlight/) for lightboxes / modals
* [http-server](https://www.npmjs.com/package/http-server) for building the site locally
* [![JQuery][JQuery.com]][JQuery-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Follow these instructions to run the STEM Resource Site page locally. This is the best way to prototype changes before copying over to the Squarespace site.

### Prerequisites

You'll need the following.
* npm
  ```sh
  npm install npm@latest -g
  ```
* http-server
  ```sh
  npm install http-server
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/whitemountainscience/stem-resource-site.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
<!-- 3. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ``` -->
3. Navigate to the base folder, then run http-server to serve the site locally
   ```sh
   cd stem-resource-site
   http-server
   ```
  * By default http-server runs on localhost port 8080. If you want to use a different port or explore other options, check out the link above under <a href="#resources">Resources</a>
4. Choose a page / version of the site to run locally:
  - The [live version of this page](https://whitemountainscience.org/stem-resource-site) using Google Sheets can be found in /sheets-rebuild. After starting the local server, you can view the page at http://localhost:8080/sheets-rebuild/
  - To work with the original, Airtable-based version of the site go to http://localhost:8080/airtable-version/
  - If you want to see a basic example of the Google Sheets API in action go to http://localhost:8080/sheets-hello-world/

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Site Files / Organization -->
## Organization

Since the wmsi site is built with Squarespace, the local organization of files for each version of the site mirrors the file structure that Squarespace sites use. Basically each site version folder (e.g. sheets-rebuild) has an index.html and a folder named ```/s/``` with CSS and JS files as well as a few images.
- ```index.html``` contains the HTML which can be found in the Code block on the [Squarespace STEM Resource page](https://whitemountainscience.org/stem-resource-site). If you make any changes to this file and want them to appear on the site, be sure to copy the html over by editing the Code block on that page.
- ```stem_site.js``` and ```resource-table.js``` contain all of the javascript code for building and displaying the table. As part of refactoring this site (August - October 2024) most of the table-specific functions appear within the ResourceTable class in resource-table.js
- The airtable-version of the site uses ```shared_functions.js``` instead of ```resource-table.js```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Resources -->
## Resources

- [Google Sheets API](https://developers.google.com/sheets/api/reference/rest) for loading STEM activities from a [google sheet](https://docs.google.com/spreadsheets/d/1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I/edit?gid=0#gid=0)
- [Google Cloud Storage](https://console.cloud.google.com/storage/browser/resource-site-testing/activity-images;tab=objects?project=resource-table&pageState=(%22StorageObjectListTable%22:(%22f%22:%22%255B%255D%22))&prefix=&forceOnObjectsSortingFiltering=false): CDN for images, maybe host some JS / CSS here too
- [Identity and Access Management (IAM)](https://cloud.google.com/iam/docs/granting-changing-revoking-access?sjid=9343487874145327148-NC&visit_id=638595002240973899-2084674553&rd=1): Guide for managing access to Google Cloud systems (including the CDN linked above)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

TODO: Decide if we want a section like this or if all contributions will be internal

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Marc Bucchieri - [@marqode](https://github.com/marqode)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 