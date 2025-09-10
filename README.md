# WMSI STEM Resource Site

Documentation for the [STEM Resource Site](https://www.whitemountainscience.org/stem-resource-site) page and ongoing development efforts. Starting in August 2024 the focus of this project is to make the backend more accessible with Google Sheets API, manage content (mostly images) through an affordable CDN like Google Cloud Console, refactor code and improve version control through Git.

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
    <li><a href="#development-workflow">Development Workflow</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This page is designed as a resource for educators to easily find activities for teaching STEM subjects. Some objectives of the project are:

- Educators can easily find STEM activities on the whitemountainscience (WMSI) website by searching and filtering a curated list.
- WMSI staff can easily maintain the list of activities and their properties in a Google Sheet, and store an image for each activity in Google Cloud Storage
- Educators external to WMSI can add activites to the sheet and potentially comment or like the activities that they find most useful (comments and likes not yet implemented)
- This repo can be modified by WMSI staff and potentially external contributors to improve the page

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [Google Cloud Platform](https://console.cloud.google.com/welcome?project=resource-table) for storing and serving up images
- [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts) to allow for easy storage / editing of activities in a [Google Sheet](https://docs.google.com/spreadsheets/d/1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I)
- [http-server](https://www.npmjs.com/package/http-server) for building the site locally
- [![JQuery][JQuery.com]][JQuery-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Follow these instructions to run the STEM Resource Site page locally. This is the best way to prototype changes before copying over to the Squarespace site.

### Prerequisites

You'll need the following.

- npm
  [Install instructions here](https://nodejs.org/en/download/package-manager)
- http-server
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

- By default http-server runs on localhost port 8080. If you want to use a different port or explore other options, check out the link above under <a href="#resources">Resources</a>

4. Choose a page / version of the site to run locally:

- The version of this page using Google Sheets can be found in /sheets-rebuild. After starting the local server, you can view the page at http://localhost:8080/sheets-rebuild/
- To work with the original, Airtable-based version of the site go to http://localhost:8080/airtable-version/
- If you want to see a basic example of the Google Sheets API in action go to http://localhost:8080/sheets-hello-world/

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Organization -->

## Organization

Since the WMSI site is built with Squarespace, the local organization of files for each version of the site mirrors the file structure that Squarespace sites use. Basically each site version folder (e.g. sheets-rebuild) has an index.html and a folder named `/s/` with CSS and JS files as well as a few images.

- `index.html` contains the HTML which can be found in the Code block on the Squarespace STEM Resource page. If you make any changes to this file and want them to appear on the site, be sure to copy the html over by editing the Code block on that page.
- `stem_site.js` and `resource-table.js` contain all of the javascript code for building and displaying the table. As part of refactoring this site (August - October 2024) most of the table-specific functions appear within the ResourceTable class in resource-table.js
- `stem_site.css` contains all the CSS styling rules for the site.
- The airtable-version of the site uses `shared_functions.js` instead of `resource-table.js`
- The airtable-version uses an additional library called [Featherlight](https://github.com/noelboss/featherlight) to render modals (lightboxes) for Featured Activities and the Info column link for each activity row. This dependency has been removed in the Google Sheets version.

### External Files

Starting with the most recent Google Sheets version of this site, image files can no longer be stored in the same table as most of the information about activities. Instead they're kept in the [Google Cloud CDN](https://console.cloud.google.com/storage/browser/_details/resource-site-testing/activity-images/wmsi-octopus.png;tab=live_object?project=resource-table).

- Access to the Google Cloud project can be managed through the [IAM and Admin page](https://console.cloud.google.com/iam-admin/iam?_ga=2.221578335.67039758.1723830160-721416152.1723659175&project=resource-table&supportedpurview=project,folder,organizationId)
- Activity information and image links are stored in this [Google Sheet](https://docs.google.com/spreadsheets/d/1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I/edit?gid=0#gid=0) and accessed using the [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)
  - Once a new image is added to the CDN, you can assign it to a Source in the sheet by adding the CDN image link in Column S. New Sources will need to be added to Column R
- Some activities have Youtube URLs assigned, which will appear in the "Info" modal for that activity in the table

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Development -->

## Development Workflow

Once you have the site running locally by following the <a href="#installation">Installation</a> instructions above, you can use this workflow to update the [live site](https://whitemountainscience.org/stem-resource-site).

- Make sure all of your local changes are saved and pushed to Github
- Copy any HTML changes in the Squarespace Code block fo the Resource Site page. In the past HTML changes have been pretty rare (see note on Comments column below).
- Upload any changed Javascript and CSS files:
  - Start by adding a link to the Resource Site page
  - In the dialog box where you would set the link destination go to Upload a File
  - Delete the file you want to upload and the re-upload it

_Note:_ As of October 2024 comments have been deprecated on the STEM Resource Site page (as set by the ALLOW_COMMENTS variable in stem_site.js). This means that past versions of the site (e.g. airtable-version) will no longer work with the code in sheets-rebuild. To add support for Comments or Likes to the site do the following:

- Set ALLOW_COMMENTS to `true`: this will cause the ResourceTable.commentSection() function to be called while setting up the table
- Uncomment / add the table header span in index.html:106 / in the live site's Code block
- Add the missing column back to the .grid-container class in stem_site.css

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Resources -->

## Resources

- [Google Sheets API](https://developers.google.com/sheets/api/reference/rest) for loading STEM activities from a [google sheet](https://docs.google.com/spreadsheets/d/1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I/edit?gid=0#gid=0)
- [Google Cloud Storage](<https://console.cloud.google.com/storage/browser/resource-site-testing/activity-images;tab=objects?project=resource-table&pageState=(%22StorageObjectListTable%22:(%22f%22:%22%255B%255D%22))&prefix=&forceOnObjectsSortingFiltering=false>): CDN for images, maybe host some JS / CSS here too
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
