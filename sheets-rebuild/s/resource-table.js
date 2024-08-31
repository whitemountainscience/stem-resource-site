class ResourceTable {
    // TODO: generate materials from list instead of harcoding them
    materials = {
        '#browser': 'Computer w/ Browser',
        '#pen-paper':'Pen and Paper',
        '#craft':'Crafting Materials',
        '#tablet': 'Tablet',
        '#robotics':'Robotics',
        '#lab-materials':'Lab Materials'
    };

    constructor(sources, results) {
        this.sources = sources;
        this.results = results;
        this.allResults = [];
        this.searchResults = [];
        this.featureList = [];
    }

    /*
        Search locally cached results (all_results) based on filter criteria
        @returns {array} - all resources that match the current search criteria
    */
    localSearch() {
        let subject = $('#subject').val() != "" ? $('#subject').val() : null;
        let experience = $('#experience').val() != "" ? $('#experience').val() : null;
        let self_led = $('#self-led').is(':checked') ? true : false;
        let search_string = $('input[type="search"]').val() != "" ? $('input[type="search"]').val() : null;
        let searchMaterials = [];
        this.getMaterialsLocal(searchMaterials);

        return this.allResults.filter((resource) => 
            (experience ? resource.Experience.split(', ').includes(experience) : true) &&
            (self_led ? resource.Tags.includes('self-led') : true) &&
            (subject ? resource.Subject.split(', ').includes(subject) : true) &&
            (search_string ? resource["Search Text"].includes(search_string) : true) &&
            (searchMaterials.length == Object.entries(this.materials).length || searchMaterials.some((el) => resource.Materials.split(', ').includes(el)))
        );
    }


    // TODO: make this work using html labels instead of assigning strings here?
    getMaterialsLocal(searchMaterials) {
        for (const [key, value] of Object.entries(this.materials)) {
            if($(key).is(':checked'))
                searchMaterials.push(value);
        }
    }

    /*
        Display results from search_results in Featured Activities and in the table
        @param {object} search_results - list of activities to display
        @param {int} page_size - number of results to display on a page.
    */
    displayResults(search_results, all) {
        if(all) this.allResults = search_results;
        this.searchResults = search_results;
        this.renderFeatures();
    }

    /*
        Generate HTML for all resources returned by a search query. 
        Called by renderTable()
        @param {array} search_resutls - resources returned by a query search to airtable
        @param {string} env - current deployment denvironment
    */
    build() {
        var new_elements;
        const grid_item = "<span class='item'>*</span>";
        this.searchResults.forEach((resource, index) => {
            let activity_link = grid_item.replace('*', '<a target="_blank" href="'+ resource["Resource Link"] +'">'+ resource["Resource Name"] +'</a>');
            if(resource['Tags'].includes('incomplete')) 
                activity_link = this.adaptActivity(resource, index);

            new_elements = activity_link;
            const author_link = '<a target="_blank" href="' + resource["Source Link"] + '">' + resource["Source"] + '</a>'
            new_elements += grid_item.replace('*', author_link);
            new_elements += grid_item.replace('*', resource["Duration"]);
            new_elements += grid_item.replace('*', resource["Experience"]);
            new_elements += grid_item.replace('*', resource["Subject"]);
            new_elements += grid_item.replace('*',  "<center><big><a href='#' data-featherlight='#resource" + index + "'>&#9432;</a></big></center>");

            $('#content').append(new_elements);
            this.addLightbox(resource, index);
            this.commentSection(resource, index);
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
    */
    commentSection(resource, index, key='Comments') {
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

        $(text_id).unbind('focus').focus(() => {
            $(this).css('height','90px');
            $(form_id).show();
        });
        this.postComment(resource, index);
    }

    /*
        Add Comment section to the bottom of a feature lightbox from the carousel
        Comment form remains hidden until user clicks on the comment box
        @param {object} resource - activity to build comments section for
        @param {int} index - index of the resource in the features carousel
    */
    addFeatureComments(resource, index) {
        var id = '#feature'+index;
        var element = $('#feature-comment-template').html().replace(/@index/g, index);
        var form_id = '.featherlight-inner #feature-comment-form'+index;
        $(id).append(element);
        if(resource.Comments != undefined) {
            $(id + ' h4').empty().html("User Comments: ");
            var comments = JSON.parse('['+resource.Comments+']');

            comments.forEach(comment => {$('#feature-comment-text' + index).append(comment[0] + ': ' + comment[1] + '<br>')});
        } 

        $('#feature-new-comment'+index).unbind('focus').focus(() => {
            $(this).css('height','90px');
            $(form_id).show();
        });
        this.postComment(resource, index, true);
    }

    /*
        Handle the event of a user posting a new comment on a featured activity
        When a user clicks the Post Comment button parse the comment text 
        and send it to Airtable
        @param {int} index - index of activity in the table, used to make IDs
        @param {object} resource - resource object to post comment for

        TODO: decide whether to keep comments, how to moderate; shorter ID names?
    */
    postComment(resource, index, feature = false) {
        // var id = '#feature-post-comment' + index;
        var id = (feature ? '#feature-post-comment' + index : '#post-comment' + index);
        var comment_id = (feature ? '#feature-new-comment' + index : '#new-comment' + index);
        var user_id = (feature ? '#feature-comment-name' + index : '#comment-name' + index);

        $(id).unbind('click').click(() => {
            var comment = $('.featherlight-inner ' + comment_id).val();
            var user = $('.featherlight-inner ' + user_id).val();
            user = (user == "" ? "Anonymous" : user);
            if(comment != '') {
                console.log('posting comment: '+ comment +' (not yet supported)');
                // $.ajax({
                //     type: 'POST',
                //     data: {
                //         "id": resource.id,
                //         "New Comment": formatted_comment
                //     }
                // }).fail((jqXHR, textStatus, errorThrown) => {
                //     console.log("post comment failed :( \n" + textStatus + ': ' + errorThrown);
                // });

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
        Call helper to build ordered list of relevant features 
        based on ratings and other criteria.
        @param {array} search_results - list of activites returned based on a user search
    */
    renderFeatures() {
        this.buildFeatureList();

        if(this.featureList.length == 0)
            $('#feature-container').hide();
        else {
            $('#feature-container').show();
            this.buildFeatures();
        }
    }

    /*
        Create three features to appear above the table. Features can fit whatever criteria we want-
        Right now the first one always comes from a list of 'best authors' and the other two are random
        @param {array} features - a list of activities that could be used as features. Currently this
            is all activities with an "Img URL" field
    */
    buildFeatures() {
        const features = this.featureList.slice(0,3);

        $('.features').empty();
        features.map((resource, i) => {
            var template = $('#featured-activity-template').html();

            template = template.replace(/@index/g, i);
            template = template.replace(/@title/g, resource["Resource Name"]);
            template = template.replace('*link', resource["Resource Link"]);
            template = template.replace('*img', 'src="'+resource.Thumbnail+'"');
            template = template.replace('*description', resource['Description']);
            template = template.replace('*experience', resource['Experience']);
            template = template.replace('*subjects', resource['Subject']);
            template = template.replace('*materials', resource['Materials']);
            template = template.replace('*source', resource['Source']);
            template = template.replace('*src_link', resource['Source Link']);
            $('.features').append(template);
            if(resource["Youtube URL"] != undefined)
                this.addVideo(resource, '#feature' + i);
            if(ALLOW_COMMENTS)
                this.addFeatureComments(resource, i);
        });
    }


    /*
        Build an ordered list of featured activities based on search results

        @param {list} search_results - list of resource objects returned from airtable search
        @param {int} max - max number of features to return
        @returns {list} feature_list - featured activities sorted with most relevant towards the top
    */
    buildFeatureList() {
        // draw from activities from favorite sources or tagged as favorites
        this.featureList = this.searchResults.filter((resource) => resource.Thumbnail && !resource.Tags.includes('incomplete'));

        // randomize the results
        this.featureList.sort(() => Math.random() - 0.5);

        // no duplicate sources next to each other
        this.featureList = this.featureList.filter((resource, i, list) => {
            if(i == 0)
                return true;
            return !(resource.Source == list[i-1].Source);
        });
    }


    /*
        Sort search results by field values. Event triggered when user clicks an 
        arrow next to one of the column headers
        @param {array} search_results - activities returned by Airtable
    */
    sortResults() {
        $('.item-header i').click((e) => {
            const clickedElement = $(e.currentTarget);
            const ascending = clickedElement.attr('class') === 'up' ? true : false;
            const field = clickedElement.parent().attr('id');

            if(field == "activity")
                this.sortText("Resource Name", ascending);
            if(field == "author")
                this.sortText("Source", ascending);
            if(field == "time")
                this.sortTime(ascending);
            if(field == "experience")
                this.sortExperience(ascending);
            if(field == "subject")
                this.sortText("Subject", ascending)

            this.clear();
            this.build(this.searchResults);

            $('i').css('border-color', 'black');
            $('i').removeAttr('alt');
            clickedElement.css('border-color', 'green');
            clickedElement.attr('alt', 'selected');
        });
    }




    ////////////////////////////// SORT FUNCTIONS ////////////////////////////////////////
    /* Used for sorting resources based on field values. Called by sortResults()   */

    /*
        Sort results by text field in alphabetical order
        Currently this is the default if no other sort is selected
        @param {array} search_results - Airtable activities based on search options
        @param {string} field - resource field key to sort by
        @param {boolean} ascending - true = a to z, false = z to a
    */
    sortText(field, ascending) {
        if(ascending)
            this.searchResults.sort((a, b) => a[field].localeCompare(b[field]));
        else
            this.searchResults.sort((a, b) => b[field].localeCompare(a[field]));
    }

    /*
        Sort results by the duration of the activity
        @param {array} search_results - Airtable activities based on search options
        @param {boolean} ascending - true = short to long, false = long to short

        TODO: how well do we want to handle edge cases of 1h00+, 1-2 hours, etc.?
    */
    sortTime(ascending) {
        this.searchResults.sort((a, b) => {

            var a_time = parseFloat(a.Duration.replace('h','.'));
            var b_time = parseFloat(b.Duration.replace('h','.'));
            if(ascending)
                return a_time - b_time;
            else
                return b_time - a_time;
        });
    }

    /*
        Sort results by the experience required for an activity
        @param {array} search_results - Airtable activities based on search options
        @param {boolean} ascending - true = low to high, false = high to low
    */
    sortExperience(ascending) {
        var exp = ["Early Learner","Beginner","Intermediate","Advanced"];
        this,this.searchResults.sort((a, b) => {
            var a_experience = a.Experience.includes(",") ? a.Experience.split(",")[0] : a.Experience;
            var b_experience = b.Experience.includes(",") ? b.Experience.split(",")[0] : b.Experience;
            if(ascending)
                return exp.indexOf(a_experience) - exp.indexOf(b_experience);
            else
                return exp.indexOf(b_experience) - exp.indexOf(a_experience);
        });
    }


    /*
        Clear the table from previous search results
    */
    clear() {
        $('.item').remove();
        $('.lightbox-grid').remove();
    }


    /*
        Display results meta data above the table. Meta data includes length of results,
        results per page, current page number, etc.
        @param {array} search_results - records returned by airtable
        @param {int} page_size - max number of records per page
    */
    displayMetaData(search_results, page_size, page_num=0, num_results=search_results.length) {
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


    ////////////////////////////// LIGHTBOX FUNCTIONS ////////////////////////////////////////
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
    addLightbox(resource, index) {
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
            html_template = html_template.slice(0,html_template.indexOf('</div>')) +  this.adaptLightbox();
        $('#content').append(html_template);
        if(resource["Youtube Url"] != '')
            this.addVideo(resource, '#resource' + index);
    }

    /*
        Add a video streaming option if the Youtube Url field is defined for this resource

        @param {object} resource - resource to render video for
        @param {string} id - element ID to add video
    */
    addVideo(resource, id) {
        var video_template = $("#lightbox-video-template").html();
        video_template = video_template.replace('*src', 'src="' + resource["Youtube Url"] + '"');
        $(id + ' a').first().append(video_template);
    }

    /*
        Add the Adaptation Activity template to an activity lightbox.
    */
    adaptLightbox() {
        return $('#adapt-text-template').html() + '</div>';
    } 

    /*
        Create a special lightbox for any activity that does not meet our lesson standards,
        and so requires adaptation by a teacher in order to be run as a classroom activity
        @param {resource} resource - Link to the activity page
        @param {int} index - activity index number used for building element IDs
        @private
    */
    adaptActivity(resource, index) {
        var markup = $('#adapt-lightbox-template').html();
        markup = markup.replace(/@id/g, 'adapt'+index);
        markup = markup.replace('*class', 'item');
        markup = markup.replace(/title/g, resource["Resource Name"]);
        markup = markup.replace('*link', resource["Resource Link"]);
        return markup;
    }
}
