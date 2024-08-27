// TODO: Decide whether to keep just experience or add grade ranges

const API_KEY = 'AIzaSyDbRcX5JRaYe9lpuiLLS_4tFMHBaRGFVF8';
// https://docs.google.com/spreadsheets/d/1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I/edit?gid=0#gid=0
const SPREADSHEET_ID = '1091aKcZE0vCAWYMJHNxil81aY9n8EEszqzzGcTjUp7I';
const RANGE = 'Sheet1!A:O';
const all_results = [];
const fav_sources = ["WMSI", "STEAM Discovery Lab", "NASA", "code.org"];

// TODO: add POST to google sheets for comments, decide on approval system
const ALLOW_COMMENTS = false;
const table = new ResourceTable(fav_sources, all_results);

$(document).ready(() => {
    initClient();

    renderSelects();
    handleSearch();

    $(window).scroll(() => scrollTopButton());
    $('#scroll-top-btn').click(() => $("html, body").animate({scrollTop: '320'}, 600));
    $('.grid-container').hide();
    $('.lds-ring').hide();
    $('#search').click(() => renderPages());
    $('#reset').click(() => resetFilters());
    $('#uncheck-materials').click(() => $('#materials-filter').children().prop('checked', false));
    fixTabIndex();
});
// $(window).load(() => console.log("Window load time: ", window.performance.timing.domComplete - window.performance.timing.navigationStart));



const initClient = () => {
    console.log('init');
    gapi.load('client', loadSheetsApi);
}

const loadSheetsApi =() => {
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
const renderPages = () => {
    const timer = Date.now();
    let page_size = parseInt($('#results-per-page').val());

    displayLoading(true);
    $('.grid-container').show();

    if(all_results.length > 0) {
        console.log("local search");
        let search_results = table.localSearch();
        table.displayResults(search_results, false);
        doneLoading();
        manageLocal(search_results, page_size);
        console.log("Render results time: ", Date.now() - timer);
    } else {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        }).then((response) => {
            const range = response.result;
            if (range.values && range.values.length > 0) {
                if(!parseGoogle(range.values))
                    return handleSearchFail();
                table.displayResults(all_results, true);
                doneLoading();
                manageLocal(all_results, page_size);
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
    Display a message to users if a search fails. This could have to do with a bad
    HTTP request, connectivity issues, or unforeseen problems.
    @private
*/
const handleSearchFail = (err) => {
    displayLoading(false);
    console.error("search failed with ", err);
    $('#results-meta').html(`We're sorry but there was an error loading your search.  
                            Please refresh the page and try again. 
                            If the problem persists, click the "Broken Link" button on the bottom right.`);
}

/*
    Hide the spinner graphic and scroll features into view
    @private
*/
const doneLoading = () => {
    displayLoading(false);
    document.querySelector('#feature-container').scrollIntoView({
        behavior: 'smooth'
    });
}

/*
    Display a spinner graphic to show that results are still loading
    @param {boolean} loading - true to show the spinner, false to hide it
    @private
*/
const displayLoading = (loading) => {
    if(loading)
        $('.lds-ring').show();
    else
        $('.lds-ring').hide();
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
const manageLocal = (search_results, page_size, page=0, build=true) => {
    var start = page*page_size;
    var end = Math.min((page+1)*page_size, search_results.length);
    this_page = search_results.slice(start, end); // change this to default first page

    if(build) {
        console.log("building table");
        table.clear();
        table.build(this_page);
        table.displayMetaData(this_page, page_size, page, search_results.length);
    }
    createLocalButtons(search_results, page_size, page);
    table.sortResults(false);
    $('.item-header i').click(() => {manageLocal(search_results, page_size, page)});
    $('#results-per-page').unbind('change').change(function() {changePageLengthLocal(start, search_results)});  
}


/*
    Attach behavior to Next Page and Last Page buttons using locally stored results
    Unbind any functions previously attached to those buttons
    Change styling to reflect (in)active buttons
    @param {array} search_results - all results that match the current search
    @param {int} page_size - number of results to render per page
    @param {int} page - current page number
    @private
*/
const createLocalButtons = (search_results, page_size, page=0) => {
    var next_page = (page+1)*page_size < search_results.length ? true : false;
    var last_page = page > 0 ? true : false;
    // console.log('create buttons with next '+ next_page + ' and last ' + last_page);
    $('.next-page').unbind('click');
    $('.last-page').unbind('click');

    if(next_page) 
        $('.next-page').click(() => {
            manageLocal(search_results, page_size, page+1);
            document.querySelector('#feature-container').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });

    if(last_page) 
        $('.last-page').click(() => {
            manageLocal(search_results, page_size, page-1);
            document.querySelector('#feature-container').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });

    if(next_page || last_page) 
        $('#bottom-page-buttons').show();
    else
        $('#bottom-page-buttons').hide();

    buttonCss(next_page, last_page);
}


/*
    Parent function for rendering the drop down menus at the top of the table
    Populate each menu with the options available in the activities array
    @private
*/
function renderSelects() {
    subjects = ["Science", "Engineering", "Math", "Social Studies", "Language Arts", "Computer Science",  "Music", "Visual Arts", "Physical Education"];
    renderSelect("#subject","Subject", subjects);
    renderExperienceSelect();
}

/*
    Add options to a dropdown menu
    @param {string} id - HTML id of the dropdown to create
    @param {string} key - JSON key in the Activity object that corresponds to the options for this menu
    @private
*/
function renderSelect(id, key, data) {
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
function renderExperienceSelect() {
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
function handleSearch() {
    $('input[type="search"]').on('keydown', function(e) {
        if (e.which == 13) {
            $('#search').click();
        }
    });
}


/*
    Alter CSS for page buttons depending on table state
    Inactive button is grey and doesn't act like a link
    @param {boolean} next_page - true if there is a next page in the table
    @param {boolean} last_page - true if there is a previous page in the table
    @private
*/
const buttonCss = (next_page, last_page) => {
    // console.log('modifying button css with next ' + next_page + ' and last ' + last_page);
    if(next_page) {
        $('.next-page').css({'cursor': '', 'color': '', 'font-weight': 'bolder'});
    } else {
        $('.next-page').unbind('click');
        $('.next-page').css({'cursor': 'default', 'color': 'grey', 'font-weight': 'inherit'});   
    }
    if(last_page) {
        $('.last-page').css({'cursor': '', 'color': '', 'font-weight': 'bolder'});
    } else {
        $('.last-page').unbind('click');
        $('.last-page').css({'cursor': 'default', 'color': 'grey', 'font-weight': 'inherit'});
    }
}



/*
    Re-set the tab indexes in lightbox functions so they don't all
    have tabindex=-1. This is a known bug with featherlight as referenced here:
    https://github.com/noelboss/featherlight/issues/285
    TODO: make our own lightboxes to avoid dealing with this
    @private
*/
const fixTabIndex = () => {
    $.featherlight.defaults.afterOpen = function() {
        var count = 1;
        new_lightbox = this;
        this.$instance.find('input, textarea, button').each(function() {
            $(this).attr('tabindex', count++);
        });
    };
}


/* 
    Reset all filters to their default values
*/
const resetFilters = () => {
    $('#subject').val("");
    $('#experience').val("");
    $(':checkbox').prop('checked',true);
    $('#self-led').prop('checked', false);
    $('input[type="search"]').val("");
}

/*
    Show the Scroll to Top Button when the user scrolls the filters out of view.
*/
const scrollTopButton = () => {
    if($(window).scrollTop() > 670)
        $('.scroll-top').show();
    else
        $('.scroll-top').hide();
}

////////////////////////////// PAGE FUNCTIONS ////////////////////////////////////////
/*
    Change the number of results displayed per page
    Call renderPage() to load a new page size from Airtable
    @param {int} start - this.earchResults index of the current first activity 
        (used to find page number)
    @private
*/
const changePageLength = (start) => {
    var page_size = $('#results-per-page').val();
    var page = Math.floor(start/page_size);
    console.log('new page length ' + page_size +' and page num ' + page);
    renderPage(page_size, page);
}

/*
    Change the number of results displayed per page
    Call _manageTableLocal() to load a new page of results
    @param {int} start - thissearchResults index of the current first activity 
        (used to find page number)
    @param {array} thissearchResults - all activities that match the current search
    @private
*/
const changePageLengthLocal = (start, search_results) => {
    var page_size = $('#results-per-page').val();
    var page = Math.floor(start/page_size);
    console.log('new page length ' + page_size +' and page num ' + page);
    _manageTableLocal(search_results, page_size, page);
}
