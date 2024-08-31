// Shared functions between different versions of the STEM Resource Table (ie master and dev branches)
//TODO: reorder functions from most- to least-used




/*
    Search locally cached results (all_results) based on filter criteria
    @returns {array} - all resources that match the current search criteria
    @private
*/
const _localSearch = () => {
    let subject = $('#subject').val() != "" ? $('#subject').val() : null;
    let experience = $('#experience').val() != "" ? $('#experience').val() : null;
    let self_led = $('#self-led').is(':checked') ? true : false;
    let search_string = $('input[type="search"]').val() != "" ? $('input[type="search"]').val() : null;
    // let search_text = $('input[type="search"]').val() != "" ? $('input[type="search"]').val().split(' ') : null;
    // console.log(search_text);
    let materials = [];
    _getMaterialsLocal(materials);

    // TODO: search text behavior, AND vs OR
    return all_results.filter(resource => {
        return((experience ? resource.Experience.split(', ').includes(experience) : true) &&
            (self_led ? resource.Tags.includes('self-led') : true) &&
            (subject ? resource.Subject.split(', ').includes(subject) : true) &&
            (materials.includes(resource.Materials.split(', ')[0])) &&
            (search_string ? resource["Search Text"].includes(search_string) : true)
        );
    });
}


// TODO: make this work using html labels instead of assigning strings here
const _getMaterialsLocal = (materials) => {
    if($('#browser').is(':checked'))
        materials.push('Computer w/ Browser');
    if($('#pen-paper').is(':checked'))
        materials.push('Pen and Paper');
    if($('#craft').is(':checked'))
        materials.push('Crafting Materials');
    if($('#tablet').is(':checked'))
        materials.push('Tablet');
    if($('#robotics').is(':checked'))
        materials.push('Robotics');
    if($('#lab-materials').is(':checked'))
        materials.push('Lab Materials');
}

/*
    Display results from search_results in Featured Activities and in the table
    @param {object} search_results - list of activities to display
    @param {int} page_size - number of results to display on a page.
*/
function _displayResults(search_results, page_size) {
    _manageTableLocal(search_results, page_size);
    _renderFeatures(search_results);
    _displayLoading(false);
    document.querySelector('#feature-container').scrollIntoView({ 
      behavior: 'smooth' 
    });
}

/*
    Parse the response data or push it directly if it is an array
    @param {object} data - response data from http proxy
    @param {array} search_results - array to append search results onto
    @private
    TODO: expand exception handling to include other cases.
*/
function _safeParse(data) {
    try {
        Array.prototype.push.apply(all_results, JSON.parse(data));
    } catch (err) {
        // console.log('parse failed, attempting push', err);
        try {
            Array.prototype.push.apply(all_results, data);
            // console.log('parsed straight json');
        } catch {
            // console.log('cannot parse search results', err);
            return false;
        }
    }
    _extraParse();
    return true;
}

function _extraParse() {
    all_results.forEach((el, i) => {
        all_results[i] = el.fields;
    });
}

/*
    Display a message to users if a search fails. This could have to do with a bad
    HTTP request, connectivity issues, or unforeseen problems.
    @private
*/
function _handleSearchFail(err) {
    _displayLoading(false);
    console.error("search failed with ", err);
    $('#results-meta').html(`We're sorry but there was an error loading your search.  
                            Please refresh the page and try again. 
                            If the problem persists, click the "Broken Link" button on the bottom right.`);
}

/*
    Generate HTML for all resources returned by a search query. 
    Called by renderTable()
    @param {array} search_resutls - resources returned by a query search to airtable
    @param {string} env - current deployment denvironment
    @private
    TODO: phase out env argument for production
*/
function _buildTable(search_results, env='production') {
    // console.log('building ' + search_results.length + ' resources');
    var new_elements;
    var grid_item = "<span class='item'>*</span>";
    search_results.forEach(function(resource, index) {
        var activity_link = grid_item.replace('*', '<a target="_blank" href="'+ resource["Resource Link"] +'">'+ resource["Resource Name"] +'</a>');
        if(resource['Tags'].includes('incomplete')) 
            activity_link = _adaptActivity(resource, index);
        
        new_elements = activity_link;
        author_link = '<a target="_blank" href="' + resource["Source Link"] + '">' + resource["Source"] + '</a>'
        new_elements += grid_item.replace('*', author_link);
        new_elements += grid_item.replace('*', resource["Duration"]);
        new_elements += grid_item.replace('*', resource["Experience"]);
        new_elements += grid_item.replace('*', resource["Subject"]);
        new_elements += grid_item.replace('*',  "<center><big><a href='#' data-featherlight='#resource" + index + "'>&#9432;</a></big></center>");

        $('#content').append(new_elements); 
        _addLightbox(resource, index);
        (env == 'dev') ? _commentSection(resource, index, 'Test Comments') : _commentSection(resource, index);;
    }); 
}

/*
    Render the comments section for an activity. At this point
    comments may be displayed as a preview (tooltip) with mouse hover,
    or as a ligthbox with full comments and form to leave your own 
    (triggered on mouse click).
    @param {object} resource - resource to render comments for
    @param {int} index - index of the resource for creating IDs
    @param {string} key - field in Airtable to draw comments from
    @private
*/
function _commentSection(resource, index, key='Comments') {
    var element = "<span class='item'>" + $('#comment-template').html() + "</span>";
    var text_id = '#new-comment' + index; 
    var form_id = '.featherlight-inner #comment-form'+index;
    
    // make sure each tooltip positions on top of other elements
    element = element.replace('*pos', 200-index).replace('*title', resource["Resource Name"]).replace('*link', resource["Resource Link"]);
    element = element.replace(/@index/g, index);

    $('#content').append(element);

    if(!ALLOW_COMMENTS) {
        $('#new-comment'+index).hide();
    }

    if(resource[key] != undefined) {
        var comments = JSON.parse('['+resource[key]+']');
        var markup = '<br>';

        comments.forEach(comment => {markup += comment[0] + ': ' + comment[1] + '<br>'});
        var preview = '<br>' + (markup.length > 60 ? markup.slice(0, 60) + '...' : markup);

        $('#comment-hover'+index + ' b').empty().html('User comments preview:').after(preview);
        $('#comment-text'+index + ' h4').empty().html('User Comments:').after(markup);
        $('#comment-badge'+index).html(comments.length.toString());
    } else if(!ALLOW_COMMENTS) {
        $('#comment-text'+index + ' h4').empty().html('No Comments Yet').after(markup);
    }

    // $(form_id).hide();
    $(text_id).unbind('focus').focus(function() {
        $(this).css('height','90px');
        $(form_id).show();
    });
    _postComment(resource, index);
}

/*
    Add Comment section to the bottom of a feature lightbox from the carousel
    Comment form remains hidden until user clicks on the comment box
    @param {object} resource - activity to build comments section for
    @param {int} index - index of the resource in the features carousel
    @private
*/
function _addFeatureComments(resource, index) {
    // var comments = "";
    var id = '#feature'+index;
    // var comments = $('#comment-template .comment-box').html();
    var element = $('#feature-comment-template').html().replace(/@index/g, index);
    var form_id = '.featherlight-inner #feature-comment-form'+index;
    $(id).append(element);
    if(resource.Comments != undefined) {
        // comments += "<b>User Comments: "
        $(id + ' h4').empty().html("User Comments: ");
        var comments = JSON.parse('['+resource.Comments+']');
        // console.log('appending ' + comments + ' to ' + id);
        comments.forEach(comment => {$('#feature-comment-text' + index).append(comment[0] + ': ' + comment[1] + '<br>')});
    } 

    $('#feature-new-comment'+index).unbind('focus').focus(function() {
        $(this).css('height','90px');
        $(form_id).show();
    });
    _postComment(resource, index, true);
}

/*
    Handle the event of a user posting a new comment on a featured activity
    When a user clicks the Post Comment button parse the comment text 
    and send it to Airtable
    @param {int} index - index of activity in the table, used to make IDs
    @param {object} resource - resource object to post comment for
    @private
    TODO: shorter ID names?
*/
function _postComment(resource, index, feature = false) {
    // var id = '#feature-post-comment' + index;
    var id = (feature ? '#feature-post-comment' + index : '#post-comment' + index);
    var comment_id = (feature ? '#feature-new-comment' + index : '#new-comment' + index);
    var user_id = (feature ? '#feature-comment-name' + index : '#comment-name' + index);

    $(id).unbind('click').click(function() {
        var comment = $('.featherlight-inner ' + comment_id).val();
        var user = $('.featherlight-inner ' + user_id).val();
        user = (user == "" ? "Anonymous" : user);
        if(comment != '') {
            var formatted_comment = '["' + user + '", "' + comment + '"]';
            console.log('posting comment: '+ comment +' to airtable from user ' + user);
            $.ajax({
                type: 'POST',
                data: {
                    "id": resource.id,
                    "New Comment": formatted_comment
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.log("post comment failed :( \n" + textStatus + ': ' + errorThrown);
            });

            // Wait for approval on new comments. Show some kind of success message that comment was received
            var markup_id = '.featherlight-inner ' + (feature ? '#feature-' : '#') + 'comment-text' + index;
            $(markup_id).empty().append('<b>Thanks for posting a comment! We will review your comment within the next 1-2 weeks and put it right here.');
            // $('.featherlight-inner #feature-comment-text'+index).append(user + ': ' + comment + '<br>');
            $('.featherlight-inner ' + comment_id).val('');
            $('.featherlight-inner ' + user_id).val('');
        }
    });
}

/*
    Render 3 Featured Activities at the top of the page. 
    Call helper function to build ordered list of relevant features 
    based on ratings and other criteria.
    @param {array} search_results - list of activites returned based on a user search

    TODO: Refine selection criteria, limit duplicate Source
*/
function _renderFeatures(search_results) {
    // console.log('rendering features');
    feature_list = _buildFeatureList(search_results);
    // console.log('building ' + feature_list.length + ' features');
    if(feature_list.length == 0)
        $('#feature-container').hide();
    else {
        $('#feature-container').show();
        _buildFeatures(feature_list);
    }
}

/*
    Create three features to appear above the table. Features can fit whatever criteria we want-
    Right now the first one always comes from a list of 'best authors' and the other two are random
    @param {array} features - a list of activities that could be used as features. Currently this
        is all activities with an "Img URL" field
    @private
*/
function _buildFeatures(features) {
    features = features.slice(0,3);

    $('.features').empty();
    features.map(function(resource, i) {
        var template = $('#featured-activity-template').html();

        template = template.replace(/@index/g, i);
        template = template.replace(/@title/g, resource["Resource Name"]);
        template = template.replace('*link', resource["Resource Link"]);
        template = template.replace('*img', 'src="'+resource.Thumbnail+'"');
        template = template.replace('*description', resource['Description']);
        template = template.replace('*experience', resource['Experience']);
        template = template.replace('*subjects', resource['Subject']);//(Array.isArray(item["Subject"]) ? item["Subject"].join(", ") : item["Subject"]));
        template = template.replace('*materials', resource['Materials']);
        template = template.replace('*source', resource['Source']);
        template = template.replace('*src_link', resource['Source Link']);
        $('.features').append(template);
        if(resource["Youtube URL"] != undefined)
            _addVideo(resource, '#feature' + i);
        if(ALLOW_COMMENTS)
            _addFeatureComments(resource, i);
    });
}

/* 
    Reset all filters to their default values
*/
function resetFilters() {
    $('#subject').val("");
    $('#experience').val("");
    $(':checkbox').prop('checked',true);
    $('#self-led').prop('checked', false);
    $('input[type="search"]').val("");
}


/*
    Build an ordered list of featured activities based on search results
    Most relevant/ highly rated activities sort towards the top of list.
    TODO: Continue to refine criteria for sorting/ filtering
            Ideally we end up with one sort() and one filter()

    @param {list} search_results - list of resource objects returned from airtable search
    @param {int} max - max number of features to return
    @returns {list} feature_list - featured activities sorted with most relevant towards the top
    @private
    TODO: time permitting, improve selection algorithm to create a 'short list' of best features
        for user search, then randomize
*/
function _buildFeatureList(search_results, max=100) {
    var feature_list = [];
    var top_features = [];

    // randomize the results
    search_results.sort(() => Math.random() - 0.5);

    search_results.forEach(function(resource) {
        if(resource.Thumbnail && !resource.Tags.includes('incomplete')) {
            // save Top Features from favorite sources
            if(fav_sources.includes(resource.Source) || resource.Tags.includes('favorite'))
                top_features.push(resource);

            // push all other items to list that have a thumbnail and are not incomplete
            else 
                feature_list.push(resource);
        }
    });

    // no duplicate sources next to each other
    feature_list = feature_list.filter(function(resource, i, feature_list) {
        if(i == 0)
            return true;
        return !(resource.Source == feature_list[i-1].Source);
    });

    // add Top Feature to beginning (just one for now)
    if(top_features.length)
        feature_list.unshift(top_features[0]);

    if(max < feature_list.length)
        feature_list = feature_list.slice(0, max);

    return feature_list;
}

/*
    Build a query string for the Airtable API. This query will take into account all filters 
    and the text-based search.
    @private

    DEPRECATED with local caching
    TODO: Do we want to require at least one search criteria?
*/
function _getQueryString() {
    var query = "AND(";
    if($('#subject').val() != "") 
        query += "Find('" + $('#subject').val() + "', Subject), ";
        // search_params.push("Subject=" + $('#subject').val());

    if($('#experience').val() != "") 
        query += "Find('" + $('#experience').val() + "', Experience), ";

    if($('#self-led').is(':checked'))
        query += "Find('self-led', Tags), ";

    query += _getMaterialsQuery();

    // split search text on spaces (and punctuation?) then use AND() to add them to query
    if($('input[type="search"]').val() != '')
        query += "AND(Find('" + $('input[type="search"]').val().toLowerCase().split(' ').join("', {Search Text}), Find('") + "', {Search Text})), ";
        // query += "Find('" + $('input[type="search"]').val().toLowerCase() + "', {Search Text}), ";

    var split_index = query.lastIndexOf(',');
    query = query.slice(0, split_index) + ")";
    
    // Bring this back if we want to require search criteria (e.g. base gets large)
    if(query == "AND)")
        query = "NOT({Resource Name}='')"
    //     alert('Please use at least one search option to find resources.');

    return query;
}

/*
    Helper function for _getQueryString
    Compile all the materials checkboxes into part of the Airtable query
    @private

    DEPRECATED with local caching
    TODO: handle if user doesn't check any boxes, ask them to check at least one
*/
function _getMaterialsQuery() {
    var query = "OR(";

    var all_materials = true;
    // Check to see if all materials are selected
    $('#materials-filter :checkbox').each(function(i, el) {
        all_materials = $(this).is(':checked');
        return all_materials;
    });

    if(all_materials)
        return "";

    if($('#browser').is(':checked'))
        query += "Find('Computer w/ Browser', Materials), ";
    if($('#pen-paper').is(':checked'))
        query += "Find('Pen and Paper', Materials), ";
    if($('#craft').is(':checked'))
        query += "Find('Crafting Materials', Materials), ";
    if($('#tablet').is(':checked'))
        query += "Find('Tablet', Materials), ";
    if($('#robotics').is(':checked'))
        query += "Find('Robotics', Materials), ";
    if($('#lab-materials').is(':checked'))
        query += "Find('Lab Materials', Materials), ";

    if(query == "OR(")
        return "";

    string_preslice = query;
    var split_index = query.lastIndexOf(',');
    query = query.slice(0, split_index) + "), ";
    return query;
}

/*
    Sort search results by field values. Event triggered when user clicks an 
    arrow next to one of the column headers
    @param {array} search_results - activities returned by Airtable
    @returns {boolean} true if table was built from existing sort, false if no build happens
    @private
    TODO: we could avoid calling this with every search by keeping a permanent reference to
        search_results
*/
function _sortResults(search_results, build=true) {
    $('.item-header i').unbind('click').click(function() {
        var ascending = $(this).attr('class') == 'up' ? true : false;
        var field = $(this).parent().attr('id');
        
        console.log('sorting by ' + field + ' with build ' + build);
        if(field == "activity")
            _sortText(search_results, "Resource Name", ascending);
        if(field == "author")
            _sortText(search_results, "Source", ascending);
        if(field == "time")
            _sortTime(search_results, ascending);
        if(field == "experience")
            _sortExperience(search_results, ascending);
        if(field == "subject")
            _sortText(search_results, "Subject", ascending)
        if(field == "rating")
            _sortRating(search_results, ascending);
        if(build) {
            _clearTable();
            _buildTable(search_results);
        }
        $('i').css('border-color', 'black');
        $('i').removeAttr('alt');
        $(this).css('border-color', 'green');
        $(this).attr('alt', 'selected');
    });
    // if sort exists from previous search apply it to this one
    $('i[alt="selected"]').click();
    if($('i[alt="selected"]').length)
        return true;
    else
        return false;
}

/*
    Show the Scroll to Top Button when the user scrolls the filters out of view.
*/
function scrollTopButton() {
    if($(window).scrollTop() > 670) 
        $('.scroll-top').show();
    else
        $('.scroll-top').hide();
}

/*
    Modify html template to create a lightbox with "Info" for an activity
    This includes a thumbnail if the activity has one, link to the activity,
    activity description, and activity tags.
    @param {object} resource - resource object as returned from Airtable
    @param {int} index - number of the activity in the search results. 
        also the html id number for this element
    @private

    TODO: create lightbox with generic thumbnail image if no thumbnail exists. 
        continue to evaluate what content fits best here
*/
function _addLightbox(resource, index) {
    var html_template = $('#info-lightbox-template').html();
    html_template = html_template.replace('*id', 'resource' + index);
    html_template = html_template.replace('*class', 'lightbox-grid');
    html_template = html_template.replace('*link', resource["Resource Link"]);
    html_template = html_template.replace('*title', resource["Resource Name"]);
    if(resource.Thumbnail && resource["Youtube URL"] == undefined) 
        html_template = html_template.replace('*img','src="' + resource.Thumbnail + '"');
    // else generic thumbnail image
    html_template = html_template.replace('*description', resource["Description"]);
    html_template = html_template.replace('*materials', resource["Materials"]);
    html_template = html_template.replace('*tags', resource.Tags);
    if(resource["Tags"].includes("incomplete"))  
        html_template = html_template.slice(0,html_template.indexOf('</div>')) +  _adaptLightbox();
    $('#content').append(html_template);
    if(resource["Youtube URL"] != undefined)
        _addVideo(resource, '#resource' + index);
}

/*
    Add a video streaming option if the Youtube URL field is defined for this resource
    v1: embed with HTML5 <video> tag. Evaluate for compatibility
    @param {object} resource - resource to render video for
    @param {string} id - element ID to add video
    @private
*/
function _addVideo(resource, id) {
    // var $thumbnail = $(id + ' img').detach();

    console.log('prepending video to ' + id + ' a');
    var video_template = $("#lightbox-video-template").html();
    video_template = video_template.replace('*src', 'src="' + resource["Youtube URL"] + '"');
    var $video = $(id + ' a').first().append(video_template);
    // $thumbnail.appendTo($video);

}

/*
    Add the Adaptation Activity template to an activity lightbox.
    @private
*/
function _adaptLightbox() {
    return $('#adapt-text-template').html() + '</div>';
} 

/*
    Create a special lightbox for any activity that does not meet our lesson standards,
    and so requires adaptation by a teacher in order to be run as a classroom activity
    @param {resource} resource - Link to the activity page
    @param {int} index - activity index number used for building element IDs
    @private
*/
function _adaptActivity(resource, index) {
    // console.log('adapting template for ' + resource["Resource Name"]);
    var markup = $('#adapt-lightbox-template').html();
    markup = markup.replace(/@id/g, 'adapt'+index);
    markup = markup.replace('*class', 'item');
    markup = markup.replace(/title/g, resource["Resource Name"]);
    markup = markup.replace('*link', resource["Resource Link"]);
    return markup;
}

/*
    Reveal a the More Info lightbox for a resource
    @param {int} index - index of the resource in the table

    TODO: use this function instead of FeatherlightJS for lightboxes
*/
function showLightbox(index) {
    var id = '#resource' + index;
    $(id).show();
}

/*
    Update a rating after it has been posted to the database
    This function changes the html for an activity's rating to 
    reflect the new user input.
    @param {object} resource - 
    @param {float} rating - new rating for the activity
    @param {int} votes - number of votes, including the one just made
    @private
*/
function _updateStars(element, name, rating, votes) {
    rating = Number.isInteger(rating) ? rating : rating.toFixed(2);
    var rating_string = rating + '/5 by ' + votes + ' votes';
    parent = $(this).parent();
    $(element).parent().parent().find('small').html(rating_string);

    // var markup = $('#stars-template').html().replace('stars-id', name);
    // markup = markup.replace('rating', Number.isInteger(rating) ? rating : rating.toFixed(2));
    // markup = markup.replace('num', votes + (votes == 1 ? ' vote' : ' votes'));
}

/*
    Display a spinner graphic to show that results are still loading
    @param {boolean} loading - true to show the spinner, false to hide it
    @private
*/
function _displayLoading(loading) {
    if(loading)
        $('.lds-ring').show();// $('#load-div').show();
    else
        $('.lds-ring').hide();//$('#load-div').hide();
}

/*
    Clear the table from previous search results
    @private
*/
function _clearTable() {
    $('.item').remove();
    $('.lightbox-grid').remove();
}

/*
    Re-set the tab indexes in lightbox functions so they don't all
    have tabindex=-1. This is a known bug with featherlight as referenced here:
    https://github.com/noelboss/featherlight/issues/285
    TODO: make our own lightboxes to avoid dealing with this
    @private
*/
function _fixTabIndex() {
    $.featherlight.defaults.afterOpen = function() {
        var count = 1;
        new_lightbox = this;
        this.$instance.find('input, textarea, button').each(function() {
            $(this).attr('tabindex', count++);
        });
    };
}



////////////////////////////// PAGE FUNCTIONS ////////////////////////////////////////
/*
    Change the number of results displayed per page
    Call renderPage() to load a new page size from Airtable
    @param {int} start - search_resutls index of the current first activity 
        (used to find page number)
    @private
*/
function changePageLength(start) {
    var page_size = $('#results-per-page').val();
    var page = Math.floor(start/page_size);
    console.log('new page length ' + page_size +' and page num ' + page);
    renderPage(page_size, page);
}

/*
    Change the number of results displayed per page
    Call _manageTableLocal() to load a new page of results
    @param {int} start - search_resutls index of the current first activity 
        (used to find page number)
    @param {array} search_results - all activities that match the current search
    @private
*/
function changePageLengthLocal(start, search_results) {
    var page_size = $('#results-per-page').val();
    var page = Math.floor(start/page_size);
    console.log('new page length ' + page_size +' and page num ' + page);
    _manageTableLocal(search_results, page_size, page);
}

/*
    Display results meta data above the table. Meta data includes length of results,
    results per page, current page number, etc.
    @param {array} search_results - records returned by airtable
    @param {int} page_size - max number of records per page
    @private
*/
function _displayMetaData(search_results, page_size, page_num=0, num_results=search_results.length) {
    console.log('display meta for page num ' + page_num +', page size ' + page_size + ', num results ' + num_results);

    $('#results-meta').empty();
    if(num_results == 0)
        $('#results-meta').html("We're sorry but your search did not return any results.");
    else if(num_results == 1)
        $('#results-meta').html("Displaying 1 Result.");
    else if(search_results.length < num_results) {         // pagination in effect
        var start = page_size*page_num + 1;
        var end = page_size*(page_num + 1) < num_results ? page_size*(page_num + 1) : num_results;
        $('#results-meta').html("Displaying " + start + "-" + end + " of " + num_results + " Results.");
    } else {
        $('#results-meta').html("Displaying " + search_results.length + " Results.");
    }
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
function _createLocalButtons(search_results, page_size, page=0) {
    var next_page = (page+1)*page_size < search_results.length ? true : false;
    var last_page = page > 0 ? true : false;
    // console.log('create buttons with next '+ next_page + ' and last ' + last_page);
    $('.next-page').unbind('click');
    $('.last-page').unbind('click');

    if(next_page) {
        $('.next-page').click(function() {
            _manageTableLocal(search_results, page_size, page+1);
            document.querySelector('#feature-container').scrollIntoView({ 
              behavior: 'smooth' 
            });
        });
    }

    if(last_page) {
        $('.last-page').click(function() {
            _manageTableLocal(search_results, page_size, page-1);
            document.querySelector('#feature-container').scrollIntoView({ 
              behavior: 'smooth' 
            });
        });
    }

    if(next_page || last_page) 
        $('#bottom-page-buttons').show();
    else
        $('#bottom-page-buttons').hide();

    _buttonCss(next_page, last_page);
}

/*
    Alter CSS for page buttons depending on table state
    Inactive button is grey and doesn't act like a link
    @param {boolean} next_page - true if there is a next page in the table
    @param {boolean} last_page - true if there is a previous page in the table
    @private
*/
function _buttonCss(next_page, last_page) {
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


