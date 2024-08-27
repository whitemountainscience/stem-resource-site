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
    <li><a href="#resources">Resources</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

This page is designed as a resource for educators to easily find activities for teaching STEM subjects. The goal is for educators to be able to add and comment on activities to help with crowdsourcing.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* Google Cloud Console
* Google Sheets API
* [![JQuery][JQuery.com]][JQuery-url]
* Featherlight CSS

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
4. Currently the Google Sheets version of this project is being build in /sheets-rebuild. You can view the page at http://127.0.0.1:8080/sheets-rebuild/

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