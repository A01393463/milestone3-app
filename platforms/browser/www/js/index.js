/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// allows data to be saved and retrieved on the device
var util = {
    store: function(namespace, data) {
      if(arguments.length > 1) // store data
      {
        return localStorage.setItem(namespace, JSON.stringify(data));
      } else { // retrieve data
        var store = localStorage.getItem(namespace);
        if(store)
        {
          return JSON.parse(store);
        } else {
          return [];
        }
      }
    }
};

// main functions
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        // get the posts stored on the device
        app.posts = util.store('posts');
        app.loadTemplates();
        // get container element and render app.posts with the til template
        app.render("container", "til", { posts: app.posts });
        app.registerCallbacks();
    },
    loadTemplates: function() {
        // get template script ids from index.html
        var templates = [ "til", "addEntryForm", "entry" ];
        
        var templateText = "";

        app.templates = {};

        for(var i=0; i<templates.length; ++i)
        {
          var templateText = document.getElementById(templates[i]).text;
          
          // assigns the script's code with the script's id
          app.templates[templates[i]] = new EJS({ text: templateText });
        }
    },
    registerCallbacks: function() {
        // when any link is clicked in the body
        $("body").on("click", "a", function(evt) {
          // cancel default action of click
          evt.preventDefault();
          // gets the href value of the clicked link and pushes it to history
          history.pushState({}, "", $(this).attr("href"));
          //render stuff with current url
          app.route(location.pathname);
        });
        $("#container").on("click", "#submit", app.addEntry);
        $("#container").on("click", ".delete", app.deleteEntry);
    },
    route: function(path) {
        console.log('route '+path);
        if(path === '/add') {
          // get container element and render {} with addEntryForm template
          app.render('container', 'addEntryForm', {});

	  $("#navTil").removeClass('active');
	  $("#navAdd").addClass('active');
          return;
        }
        if(/\/til\/(\d*)/.test(path) ) // sees if path contains /til/#
        {
          // gets just the id
          var id = parseInt( path.match(/\/til\/(\d*)/)[1] );
          // get container element and render app.posts[id] with entry template
          app.render("container", "entry", { post: app.posts[id] });
          
	  $("#navAdd").removeClass('active');
	  $("#navTil").addClass('active');
          return;
        }
        // get container element and render app.posts with til template
        app.render("container", "til", { posts: app.posts });
	$("#navAdd").removeClass('active');
	$("#navTil").addClass('active');
    },
    addEntry: function(evt) {
        // cancels default action of click
        evt.preventDefault();

        // gets the data from the form
        var slug = $("#slug").val();
        var body = $("#body").val();

        // puts the data in an entry object
        var entry = { slug: slug, body: body };

        // adds the new entry to the list of posts
        app.posts.push(entry);
        // stores the new list of posts on device
        util.store("posts", app.posts);

        // get container element and render app.posts with til template
        app.render("container", "til", { posts: app.posts });
    },
    deleteEntry: function() {
        // gets value of data-id from the clicked link element
        var entryID = $(this).attr('data-id');
        // finds the specific post and deletes it from the list
        app.posts.splice(entryID, 1);
        // stores the new list of posts on device
        util.store('posts', app.posts);

        // get container element and render app.posts with til template
        app.render("container", "til", { posts: app.posts });
    },
    // Update DOM on a Received Event
    render: function(id, template, data) {
        var containerElement = document.getElementById(id);

        // render the data using the ejs template and convert it to html
        var html = app.templates[template].render(data);

        containerElement.innerHTML = html;
    }
};

// starts everything
app.initialize();
