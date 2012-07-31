// The shell class contains a set of note containers which contain notes.  It's responsible
// for managing everything.

var Shell = new Class ({
	Implements : [Options, Events],
	
	options : {
		maxNotes: 20,
        snapshotLimit: 20
	},
	
	initialize : function ( element, user, options ) {
		this.setOptions( options );
		this.element = $(element); // Reference to shell element - not a new Element
        this.user = user;
				
		// Build shell for output		
		this.setup();

        // Add shell event delegation
        this.addEvents();

        // Assume we're starting at newest snapshot
        this.undoLevel = 0;
		
		return this;
	},

    // Initial note creation, includes a new container and two default containers
    setup : function () {
        if ( this.user ) {
            // If user is set, load user bookmarks
            this.loadUserBookmarks();
        } else {
            // Otherwise, load a default layout
            this.defaultSetup();
        }
    },

    defaultSetup : function () {
        // Special zone for new notes, doesn't contain a permanent note as it's a working
        // area for new notes or notes from deleted containers, that sort of thing.  Can't be
        // deleted.

        this.addDivider();

        // Add a couple other zones and notes just to get things started.  Pants.
        var zone1 = this.addZone( 'New Category' );
        zone1.getElement( '.note-container' ).grab( this.addNote( "New Note" ) );
        this.element.grab( zone1, 'top' );

    },

    addEvents : function () {
        var that = this;

        // Event delegation, handled from shell because dynamic elements need to be bound

        // Collapse zone
        this.element.addEvent( 'click:relay(div.zone-collapse-button)', function ( event, el ) {
            el.getParent('.zone-header').addClass('zone-header-collapsed');
            el.getParent('.note-zone').addClass('note-zone-collapsed');
            var expandElement = new Element( 'div', { class: 'zone-expand-button button' }).replaces( el );
        });

        // Expand zone
        this.element.addEvent( 'click:relay(div.zone-expand-button)', function ( event, el ) {
            el.getParent('.zone-header').removeClass('zone-header-collapsed');
            el.getParent('.note-zone').removeClass('note-zone-collapsed');
            var collapseElement = new Element( 'div', { class: 'zone-collapse-button button' }).replaces( el );
        });

        // Add note to specific zone
        this.element.addEvent( 'click:relay(div.zone-add-note-button)', function ( event, el ) {
            var newNote = new Note( 'New Note' );

            el.getParent( '.zone-header').getNext('.note-container').grab( newNote.getElement(), 'top' );
            Shell.update();
        });

        // Zone left
        this.element.addEvent( 'click:relay(div.zone-left-button)', function ( event, el ) {
            that.moveZoneLeft( el );
            Shell.update();
        });

        // Zone right
        this.element.addEvent( 'click:relay(div.zone-right-button)', function ( event, el ) {
            that.moveZoneRight( el );
            Shell.update();
        });

        // Remove zones
        this.element.addEvent( 'click:relay(div.zone-close-button)', function ( event, el ) {
            that.removeZone( $(el.getParent('td')) );

            Shell.update();
        });

        // Zone title rename
        this.element.addEvent( 'dblclick:relay(div.zone-title)', function ( event, el ) {
            that.renameElement( el );
        });

        // Remove notes
        this.element.addEvent( 'click:relay(div.note-close-button)', function ( event, el ) {
            that.removeNote( $(el.getParent('.note')) );

            Shell.update();
        });

        // Note up
        this.element.addEvent( 'click:relay(div.note-up-button)', function ( event, el ) {
            Note.moveNoteUp( el );
        });

        // Note down
        this.element.addEvent( 'click:relay(div.note-down-button)', function ( event, el ) {
            Note.moveNoteDown( el );
        });

        // Add subnote from note
        this.element.addEvent( 'click:relay(div.new-subnote-button)', function ( event, el ) {
            var newSubnote = new Subnote( el.getParent('.note').getElement('.note-subnote-container'),
                {
                    text: "enter text"
                });
            Shell.update();
        });

        // Note title rename
        this.element.addEvent( 'dblclick:relay(div.title-text)', function ( event, el ) {
            that.renameElement( el );
        });

        // Remove note
        this.element.addEvent( 'click:relay(.note-close-button)', function ( event, el ) {
            el.getParent('.note').dispose();
            Shell.update();
        });

        // Note text contents
        this.element.addEvent( 'dblclick:relay(.note-text)', function ( event, el ) {
            that.modifyText( el );
        });

        // Subnote menu hide, works weird if you place it in link addEvents
        /*this.element.addEvent( 'mouseleave:relay(div.subnote)', function ( event, el ) {
            var subnoteMenu = el.getElement('.subnote-menu');

            subnoteMenu.set('morph', {
                duration: 100,
                transition: 'sine:out'
            });

            subnoteMenu.morph({
                opacity: 0
            });
        });*/

        // Subnote title rename
        //this.element.addEvent( 'click:relay(.subnote-edit-button)', function ( event, el ) {
            //that.renameElement( el.getParent('.subnote-menu').getPrevious('.subnote-contents') );
        //});

        // Subnote title rename
        this.element.addEvent( 'dblclick:relay(.subnote-contents)', function ( event, el ) {
            that.renameElement( el );
        });

        // Remove subnote
        this.element.addEvent( 'click:relay(.subnote-close-button)', function ( event, el ) {
            el.getParent('.subnote').dispose();
            Shell.update();
        });

        // Set subnote status (done/not done)
        this.element.addEvent( 'click:relay(.subnote-status)', function ( event, el ) {
            el.toggleClass( 'not-done' );
            el.toggleClass( 'done' );
            Shell.update();
        });
    },

    renameElement : function ( el ) {
        // Save original contents for reset if desired
        var originalContents = el.get('html');

        // Input element for new title
        var newTitleInput = new Element( 'input#new-title', {
            type: 'text',
            value: el.get('html'),
            events: {
                // If user leaves context, reset to original contents
                blur: function () {
                    // Replace with original contents if blurs
                    el.set( 'html', originalContents );
                },

                // Get rid of contents on dblclick
                click: function () {
                    this.set('value', '');
                }
            }
        });

        // Erase element
        el.set('html', '');

        // Then attach input
        el.grab( newTitleInput );

        // Set focus to input
        newTitleInput.focus();

        // Set up keyboard crap
        var saveTitle = function () {
            newTitleInput.removeEvents(); // Remove blur so it doesn't fire before this is done
            el.set( 'html', newTitleInput.get('value') );
            keyboardHook.deactivate();

            Shell.update();
        }

        var keyboardHook = new Keyboard();

        keyboardHook.addEvents({
            'enter': saveTitle
        }).activate();
    },

    // Similar to the above but for textareas. Saves on blur instead of enter and also
    // Does some special text processing before saving and editing.  Can also be made
    // undraggable for multiline edits.  Pulls edit text from hidden un-parsed field
    // to save on de-parsing time.
    modifyText : function ( el ) {
        // Set up original contents for edit
        // Deparse deals with certain tags I don't want stripped (like <br /> --> \n)
        // for easier editing
        el.set( 'html', Note.deparse( el.get('html') ) );

        // Input element for new title
        var newText = new Element( 'textarea#new-text', {
            value: el.get('text'), // Deparse takes care of some stuff you need (\n)
            events: {
                // If user leaves context, reset to original contents
                blur: function () {
                    // Replace with original contents if blurs
                    saveText();
                }
            }
        });

        // Erase element
        el.set('html', '');

        // Then attach input
        el.grab( newText );

        // Set focus to input
        newText.focus();

        // Set up keyboard crap
        var saveText = function () {
            var parsed = Note.parse( newText.get('value') );
            el.set( 'html', parsed );

            Shell.update();
        }

        // Flip off dragging if element is a note so text can be selected
        //if ( el.getParent('.note') )
        //el.getParent('.note').addClass('no-drag');

        // Turn dragging back on if a note
        //if ( el.getParent('.note') )
        //el.getParent('.note').removeClass('no-drag');



        /*var saveTitle = function () {
            newTitleInput.removeEvents(); // Remove blur so it doesn't fire before this is done
            var parsed = Note.parse( newTitleInput.get('value') );
            el.set( 'html', parsed );
            keyboardHook.deactivate();



            Shell.update();
        }*/
    },

    addZone : function ( title ) {
        var newZoneContainer = new Element( 'td.zone' );
        var newZone = new Element( 'div#' + ( $$('td.zone').length ) );

        // Set up new note zone (different behavior from normal zone)
        newZone.addClass( "note-zone" );

        // Grab zone to container based on id
        newZoneContainer.grab( newZone );

        // Zone header and title element
        var zoneHeader = new Element( 'div.zone-header').grab(
            new Element( 'div.header-corner' )
        ).grab( new Element( 'div.zone-title', {
            html: title
        }));
        newZone.grab( zoneHeader );

        // Zone menu
        zoneHeader.grab( new Element( 'div.zone-menu' ).
            grab( new Element( 'div', {
                class: 'zone-collapse-button button'
            })).
            grab( new Element( 'div', {
                class: 'zone-add-note-button button'
            })).
            grab( new Element( 'div', {
                class: 'zone-left-button button'
            })).
            grab( new Element( 'div', {
                class: 'zone-right-button button'
            })).
            grab( new Element( 'div', {
                class: 'zone-close-button button'
            }))
        );

        // Zone note container
        var noteContainer = new Element( 'div.note-container' );
        newZone.grab( noteContainer );

        // Zone drop element and icon
        newZone.grab(
            new Element( 'div.zone-drop').grab(
                new Element( 'div.drop-icon'
                )).grab(
                new Element( 'div.drop-corner' )
            ));

        // Zone hover effects
        this.addZoneEffects( newZone );

        return newZoneContainer;
    },
	
	// Grabs note to shell element.  Will be added with new zone by default which can just be
	// deleted by merging with another zone
	addNote : function ( title ) {
		if ( title ) {
			var that = this;

            // Create note itself
			var newNote = new Note( title, null, null, {
                id: 'note-' + this.element.getElements('.note').length
            });

            return newNote.getElement();
		}
	},

    // Adds divider between zones
    addDivider : function () {
        // Zone border
        this.element.grab( new Element( 'td', {
            'class': 'zone-divider'
        }).grab( new Element( 'div' )), 'top' );
    },

    // Adds zone, note and divider and grabs to element as a single unit using the above functions
    addUnit : function () {
        this.addDivider();
        var newZone = this.addZone( "New Category" );
        newZone.getElement('.note-container').grab( this.addNote( "New Note" ) );
        this.element.grab( newZone, 'top' );
    },
	
	removeNote : function ( note ) {
		if ( note ) {
			// Get parent zone before deleting so it can still be accessed
			var parent = note.getParent( 'td' );
			
			// First remove note
			note.dispose();
			
			// Then remove zone if it's empty
			if ( parent.getElements('.note').length == 0 ) {
				// Remove divider before parent, should always be previous element
				parent.getPrevious().dispose();
				parent.dispose();				
			}
		}
	},

    removeZone : function ( zone ) {
        if ( zone ) {
            // First remove divider
            zone.getNext().dispose();

            // Then remove zone itself
            zone.dispose();
        }
    },

    moveZoneLeft : function ( el ) {
        var parent = el.getParent('.zone');

        if ( !parent.getPrevious('.zone').getElement('#zone-new') ) {
            var previous = parent.getPrevious('.zone');
            var temp = previous.getElement('.note-zone');

            previous.grab( parent.getElement('.note-zone') );
            parent.grab( temp );
        }
    },

    moveZoneRight : function ( el ) {
        var parent = el.getParent('.zone');

        if ( parent.getNext('.zone') ) {
            var next = parent.getNext('.zone');
            var temp = next.getElement('.note-zone');

            next.grab( parent.getElement('.note-zone') );
            parent.grab( temp );
        }
    },

    addZoneEffects : function ( zone ) {
        // Standalone morph because el.morph doesn't play well with others
        var headerHover = new Fx.Morph( zone.getElement( '.zone-header' ), {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });

        var dropHover = new Fx.Morph( zone.getElement( '.zone-drop' ), {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });

        // Container hover events
        zone.addEvents({
            mouseover: function () {
                headerHover.start({
                    borderTopRightRadius: 3,
                    borderTopLeftRadius: 3
                });
                dropHover.start({
                    borderBottomRightRadius: 3,
                    borderBottomLeftRadius: 3
                });
            },

            mouseout: function () {
                headerHover.start({
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10
                });
                dropHover.start({
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10
                });
            }
        });
    },

    loadUserBookmarks : function ( level ) {
        level = level || 0;
        var that = this;

        var retrieveRequest = new Request({
            url: 'inc/request.php',
            onSuccess: function ( response ) {
                var decoded = JSON.decode( response );

                // Build bookmarks if nothing exploded
                if ( decoded.error )
                    Shell.setError( decoded.error );
                else
                    that.buildUserShell( decoded );

                // Create summary for footer element
                Shell.buildSummary();
            }
        });

        // Send request for most snapshot to db
        retrieveRequest.send( "user=" + "tim" + "&level=" + level );
    },

    undo : function () {
        if ( this.undoLevel < this.options.snapshotLimit ) {
            this.undoLevel++;
            this.loadUserBookmarks( this.undoLevel );
        }
    },

    redo : function () {
        if ( this.undoLevel > 0 ) {
            this.undoLevel--;
            this.loadUserBookmarks( this.undoLevel );
        }
    },

    // Expects a JSON object from db
    buildUserShell : function ( bookmarks ) {
        var that = this;

        // Make sure shell is empty before building (for undo purposes)
        this.element.getElements( 'td.zone, td.zone-divider' ).each( function ( el ) {
            el.dispose();
        });

        // Reverse retrieved array because new elements are added to the end (saved backwards)
        bookmarks.shells.reverse();

        bookmarks.shells.each( function ( zone ) {
            // Add new zone
            var newZone = that.addZone( zone.title );
            that.addDivider();
            that.element.grab( newZone, 'top' );

            // Add notes to zone
            zone.notes.each( function ( note ) {
                var newNote = new Note( note.title, note.date, note.text, {
                    id: 'note-' + that.element.getElements('.note').length
                });

                newZone.getElement('.note-container').grab( newNote.getElement() );

                // Remove empty note isn't empty
                if ( note.subnotes.length > 0 || note.text != '' )
                    newNote.getElement().getElement( '.note-empty').dispose();

                // Add subnotes to note
                note.subnotes.each( function ( subnote ) {
                    var newSubnote = new Subnote( newNote.getElement().getElement('.note-subnote-container'),
                        {
                            text: subnote.text,
                            date: subnote.date,
                            status: subnote.status
                        });
                });
            });
        });
    },
	
	// Getters/setters
	
	getShell : function () {
		if ( typeof( this.element ) != 'undefined' )
			return this.element;
	}
});

// Static functions

Shell.storeUserBookmarks = function () {
    var storeRequest = new Request({
        url: 'inc/request.php',
        onSuccess: function ( response ) {
            if ( response ) {
                var decoded = JSON.decode( response );

                if ( decoded.error )
                    Shell.setError( decoded.error );
            }
        }
    });

    var bookmarks = {
        shells: []
    }

    $$('.note-zone-new, .note-zone').each( function( zone, zoneIndex ) {
        bookmarks.shells.push({
            "id": zone.get('id'),
            "title": zone.getElement('.zone-title').get('html'),
            "notes": []
        });

        zone.getElements('.note').each( function( note, noteIndex ) {
            bookmarks.shells[zoneIndex].notes.push({
                "title": note.getElement('.title-text').get('html'),
                "text": note.getElement('.note-text').get('html'),
                "date": note.getElement('.title-date').get('text'),
                "subnotes": []
            });

            note.getElements('.subnote').each( function( subnote ) {
                bookmarks.shells[zoneIndex].notes[noteIndex].subnotes.push({
                    "status": subnote.getElement('.subnote-status').get('class'),
                    "text" : encodeURIComponent( subnote.getElement('.subnote-contents').get( 'text' ) ),
                    "date" : subnote.getElement( '.subnote-date-container' ).get( 'text' )
                });
            });
        });
    });

    //console.log( "notes: " + JSON.encode(bookmarks) );

    storeRequest.send( "bookmarks=" + JSON.encode(bookmarks) );
}

// Returns nested list of bookmarks in div elements.  Level can be 1-2.
// 1 = shells
// 2 = notes
// 3 = subnotes
// Will return everything in that level and above (zones and notes by default)
Shell.listBookmarks = function ( level ) {
    level = level || 2;

    // Create top-level element if there's something to contain
    if ( level >= 1 ) {
        var bookmarks = new Element( 'div.bookmark-summary' );

        $$('.note-zone').each( function( zone ) {
            // Create parent zone element
            var zoneSummary = new Element( 'div.zone-summary' ).
                grab( new Element( 'div.zone-title-summary', {
                    html: zone.getElement('.zone-title').get('text'),
                    alt: zone.get('id')
                }));

            bookmarks.grab( zoneSummary );

            if ( level >= 2 ) {
                zone.getElements('.note').each( function( note ) {
                    var noteSummary = new Element( 'div.note-summary' ).
                        grab( new Element( 'div.note-title-summary', {
                            html: note.getElement('.title-text').get('text')
                        }));

                    zoneSummary.grab( noteSummary );

                    if ( level >= 3 ) {
                        zone.getElements('.subnote').each( function( subnote ) {
                            var subnoteSummary = new Element( 'div.subnote-summary' ).
                                grab( new Element( 'div.subnote-content-summary', {
                                    html: note.getElement('.subnote-contents').get('text')
                                }));

                            zoneSummary.grab( subnoteSummary );
                        });
                    }
                });
            }
        });

        return bookmarks;
    } else
        return false;
}

// Get summary of bmarks and set in footer
Shell.buildSummary = function () {
    // Delete element before creating if it exists
    if ( $$('#footer .bookmark-summary') )
        $$('#footer .bookmark-summary').each( function ( el ) {
            el.dispose();
        });

    this.summary = Shell.listBookmarks();
    $('footer-summary').grab( this.summary );
}

// Saves current bookmark snapshot and updates summary
Shell.update = function () {
    Shell.storeUserBookmarks();
    Shell.buildSummary();
}

// Searches shell elements
// Depth determines search depth
// Returns array of result elements
// 1 = shells
// 2 = notes
// 3 = subnotes
// Default depth is 2 (notes)
// Note that subnote search returns parent note
Shell.search = function ( query, level ) {
    level = level || 2;
    var results = {
        zones: [],
        notes: [],
        subnotes: []
    };

    // Search zones
    if ( level >= 1 ) {
        $$('.zone-title').each( function (el) {
            if ( ~el.get('text').toLowerCase().indexOf( query.toLowerCase() ) )
                results.zones.push( el.getParent('.note-zone') );
        });

        // Search notes
        if ( level >= 2 ) {
            $$('.note-text').each( function (el) {
                if ( ~el.get('text').toLowerCase().indexOf( query.toLowerCase() ) )
                    results.notes.push( el.getParent('.note') );
            });

            if ( level >= 3 ) {
                $$('.subnote-contents').each( function (el) {
                    if ( ~el.get('text').toLowerCase().indexOf( query.toLowerCase() ) )
                        results.subnotes.push( el.getParent('.note') );
                });
            }
        }

        // Return results if level >= 1
        return results;
    }

    // Otherwise just false
    return false;
}

// Sets error code in appropriate place, expects a string
Shell.setError = function ( message ) {
    $('menu').grab( new Element( 'div.error', {
        html: message
    }));
}