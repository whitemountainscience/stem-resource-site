// When the page loads populate the table with activities and render the dropdown menus.
// Add a graderange to each activity that JS can interpret

const API_KEY = 'AIzaSyDbRcX5JRaYe9lpuiLLS_4tFMHBaRGFVF8';
const SPREADSHEET_ID = '1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I';
const RANGE = 'Sheet1!A:O';
const all_results = [];
const fav_sources = ["WMSI", "STEAM Discovery Lab", "NASA", "code.org"];

// TODO: add POST to google sheets for comments, decide on approval system
const ALLOW_COMMENTS = false;

$(document).ready(function(){
    initClient();

    _renderSelects();
    _handleSearch();

    $(window).scroll(() => scrollTopButton());
    $('#scroll-top-btn').click(() => $("html, body").animate({scrollTop: '320'}, 600));
    $('.grid-container').hide();
    $('.lds-ring').hide();
    $('#search').click(function() {renderPages()});
    $('#reset').click(function() {resetFilters()});
    $('#uncheck-materials').click(function() {
        $('#materials-filter').children().prop('checked', false);
    });
    _fixTabIndex();
});
$(window).load(() => console.log("Window load time: ", window.performance.timing.domComplete - window.performance.timing.navigationStart));



function initClient() {
    console.log('init');
    gapi.load('client', loadSheetsApi);
}

function loadSheetsApi() {
    gapi.client.setApiKey(API_KEY);
    return gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4')
        .then(() => {
            console.log("gapi loaded successfully");
            renderPages();
        }, (error) => {
            console.error('Error loading GAPI client for API', error);
        });
}



/*
    Obtain search results and cache them locally, displaying pages one at a time
*/
function renderPages() {
    let timer = Date.now();
    let query_string = _getQueryString();
    let page_size = parseInt($('#results-per-page').val());

    _displayLoading(true);
    $('.grid-container').show()

    if(all_results.length > 0) {
        let search_results = _localSearch();
        _displayResults(search_results, page_size);
        console.log("Render results time: ", Date.now() - timer);
    } else {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        }).then((response) => {
            console.log('resp ', response);
            const range = response.result;
            if (range.values && range.values.length > 0) {
                if(!parseGoogle(range.values))
                    return _handleSearchFail();
                _displayResults(all_results, page_size);
                console.log("Initial load time: ", Date.now() - window.performance.timing.navigationStart);
            } else {
                console.log('No data found.');
            }
        }, (response) => {
            console.error(response.result.error.message);
        });
    }
}

const parseGoogle = (data) => {
        const headers = data[0]; // First array contains the headers
        try {
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const obj = {};
        
                headers.forEach((header, index) => {
                    obj[header] = row[index] || ""; // Assign value or empty string if undefined
                });
        
                all_results.push(obj);
            }
        } catch(error) {
            console.error(error);
            return false;
        }
    
        return true;
}



/*
    Manage locally stored search results. Update sorting, meta data, and buttons
    as necessary.
    @param {array} search_results - all results returned by the current search
    @param {int} page_size - number of results per page
    @param {int} page - number of the current page
    @param {boolean} build - defaults to true, false means initial build has already happened
    @private
*/
function _manageTableLocal(search_results, page_size, page=0, build=true) {
    var start = page*page_size;
    var end = Math.min((page+1)*page_size, search_results.length);
    this_page = search_results.slice(start, end); // change this to default first page
    // console.log('rendering search results from index ' + start + ' to ' + end);
    if(build) {
        _clearTable();
        _buildTable(this_page);
        _displayMetaData(this_page, page_size, page, search_results.length);
    }
    _createLocalButtons(search_results, page_size, page);
    _sortResults(search_results, false);
    $('.item-header i').click(() => {_manageTableLocal(search_results, page_size, page)});
    $('#results-per-page').unbind('change').change(function() {changePageLengthLocal(start, search_results)});  
}


/*
    Parent function for rendering the drop down menus at the top of the table
    Populate each menu with the options available in the activities array
    @private
*/
function _renderSelects() {
    subjects = ["Science", "Engineering", "Math", "Social Studies", "Language Arts", "Computer Science",  "Music", "Visual Arts", "Physical Education"];
    _renderSelect("#subject","Subject", subjects);
    // _renderGradeSelect();
    _renderExperienceSelect();
}

/*
    Add options to a dropdown menu
    @param {string} id - HTML id of the dropdown to create
    @param {string} key - JSON key in the Activity object that corresponds to the options for this menu
    @private
*/
function _renderSelect(id, key, data) {
    var select_options = $(id).children().toArray().map(i => i.innerHTML);
    var new_options = [];
    data.forEach(item => new_options.push(item));

    $(id).append(
        $.map(new_options, function(item) {
            return '<option value="' + item + '">' + item + '</option>';
        }).join());
}

/*
    Add options to the experience level dropdown menu
    Give users optiosn for beginner, intermediate, advanced
    @private
*/
function _renderExperienceSelect() {
    var grade_options = ['Early Learner','Beginner','Intermediate','Advanced'];
    $('#experience').append(
        $.map(grade_options, function(item) {
            return '<option value="' + item + '">' + item + '</option>';
        }).join());
}

/*
    Start a new search if the user presses "Enter" after typing in the search box.
    With the new (non-datatables) implementation this could also be handled by
    making the search bar part of a form with a Submit button
*/
function _handleSearch() {
    $('input[type="search"]').on('keydown', function(e) {
        if (e.which == 13) {
            $('#search').click();
        }
    });
}







