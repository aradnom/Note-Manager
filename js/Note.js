// Container class for dropping notes into

var Note = new Class ({
	Implements : [Options, Events],
	
	options : {
		maxNotes: 20,
		noteHeight: 50,
		backgroundColor: '#0f0',
        id: 0
	},
	
	initialize : function ( title, date, text, options ) {
		this.setOptions( options );

		var that = this;

        // Main container
		this.note = new Element( 'div', {
			class: "note droppable"
		});

        // Create title element, contains title text, date and menu
        var titleElement = new Element( 'div.note-title' );

        // Create new date if not passed
        if ( !date ) {
            var date = new Date();
            date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
        }

        titleElement.grab( new Element( 'div.title-date', {
            html: date
        }));

        // Title text
        titleElement.grab(new Element( 'div.title-text', {
            html: title
        }));

        // Menu
        titleElement.grab( new Element( 'div', {
            'class': 'note-menu'
        }).
            grab( new Element( 'div', {
                'class': 'archive-note button'
            })).
            grab( new Element( 'div', {
                'class': 'new-subnote-button button'
            })).
            grab( new Element( 'div', {
                'class': 'note-up-button button'
            })).
            grab( new Element( 'div', {
                'class': 'note-down-button button'
            })).
            grab( new Element( 'div', {
                'class': 'note-close-button button'
            })));
		
		// Add title along with note menu
		this.note.grab( titleElement );
		
		// Add text container and subnote container along with empty element
        this.note.grab( new Element( 'div.text-container' ).
            grab( new Element( 'div.note-subnote-container' ) ).
            grab( new Element( 'div', {
                'class': 'note-text button',
                'html' : text
            }).
                grab( new Element( 'div.note-empty', {
                    html: "Add text here"
                }))
        ));


        // Add note drag effects
        this.addEffects();

		return this;
	},
	
	addNote : function ( note ) {
		if ( typeof( this.notes ) != 'undefined' && this.notes.length < this.options.maxNotes ) {
			this.notes.push( note );
			
			this.note.setStyles({
				height: this.notes.length * this.options.noteHeight
			});
		}
	},

    // Should be added only by the container because it needs to reference the parent element
    // Can be used with this or with passed element (static)
	addEffects : function ( note ) {
		var el = note == null ? this.note : $(note);
        var that = this;

        // Standalone morph because el.morph doesn't play well with others
        var noteHover = new Fx.Morph( el, {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });
		
		// Drag event		
		/*var noteDrag = new Drag.Move( el, {
			droppables: '.note-zone',

            onBeforeStart : function ( el, e ) {
                // Check if element is draggable before going anywhere
                if ( el.hasClass('no-drag') )
                    this.detach();
                else
                    this.attach();
            },
			
			onStart: function (el, e) {
				// Set parent z-index higher than all others so note is always above other containers
				el.getParent( '.note-zone' ).setStyle( 'z-index', 2 );

                // Set note index higher than others in note zone
                el.setStyle( 'z-index', 2 );

                // Designate this note as active - necessary so it's not attempting to process a drop
                // request on itself when merging notes (.note)
                el.removeClass( 'droppable' );

                // Update droppable list as it might have changed
                this.droppables = $$('.note-zone, .note.droppable');
			},
			
			onDrop: function ( el, droppable, event ) {
				// If droppable exists, make new drop element
				if ( droppable ) {
                    // Merge notes
                    if ( droppable.hasClass('droppable') ) {
                        // Notes should be merged only if they have the same zone - that wau you can't accidentally
                        // merge two notes when moving zones.  Which I can see happening a lot.
                        if ( el.getParent() == droppable.getParent() ) {
                            // Move notes over
                            el.getElements('.note').each( function (note) {
                                droppable.grab( note );
                            });

                            // Then destroy old container
                            el.dispose();

                            // Remove empty element from droppable if at least one note exists
                            if ( droppable.getElement('.note') && droppable.getElement( '.note-empty' ) )
                                droppable.getElement( '.note-empty' ).dispose();

                            // Persist changes to db
                            Shell.update();
                        } else
                            that.snapToOrigin( el );

                    // Otherwise just move to different zone
                    } else {
                        // Reset parent element to default z-index before making new element
                        el.getParent('.note-zone').setStyle( 'z-index', 1 );

                        // Reset note z-index
                        el.setStyle( 'z-index', 1 );

                        // Designate as droppable again
                        el.addClass( 'droppable' );

                        // Attach new element to droppable and delete old element
                        droppable.getElement( '.note-container' ).grab( el );

                        // Reset positioning, otherwise moo will attempt to position it from where it was last
                        el.setStyles({
                            left: 0,
                            top: 0
                        });

                        // Persist changes to db
                        Shell.update();
                    }

                    // Regardless, remove enter class
                    if ( el.getElement('.note-title').hasClass('on-enter') )
                        el.getElement('.note-title').removeClass('on-enter');
				} else
                    that.snapToOrigin( el );
			},
		 
			onEnter: function ( el, drop ) {
				el.getElement('.note-title').addClass('on-enter');
			},
		 
			onLeave: function ( el, drop ) {
                if ( el.getElement('.note-title').hasClass('on-enter') )
                    el.getElement('.note-title').removeClass('on-enter');
			}
		});*/
	},

    snapToOrigin : function ( el ) {
        // Reset parent element to default z-index before making new element
        el.getParent('.note-zone').setStyle( 'z-index', 1 );

        // Reset element z-index
        el.setStyle( 'z-index', 1 );

        // Otherwise just snap back to origin
        el.set( 'morph', {
            duration: 500,
            transition: 'elastic:out'
        });

        el.morph({
            top: 0,
            left: 0
        });
    },
	
	// Returns a reference to the created note element (constructor will return ref to
    // object itself)
	getElement : function () {
		if ( typeof( this.note ) != 'undefined' )
			return this.note;
	}
});

// Static functions

Note.moveNoteUp = function ( el ) {
    var parent = el.getParent('.note');

    if ( parent.getPrevious('.note') ) {
        var previous = parent.getPrevious('.note');
        previous.grab( parent, "before" );

        // Save the results
        Shell.update();
    }
}

Note.moveNoteDown = function ( el ) {
    var parent = el.getParent('.note');

    if ( parent.getNext('.note') ) {
        var next = parent.getNext('.note');
        next.grab( parent, "after" );

        // Save the results
        Shell.update();
    }
}

Note.archive = function ( el ) {
    el.addClass('archived');
    el.getElement('.note-title').grab( new Element( 'div.archived-menu').grab(
        new Element( 'div', {
            class: 'unarchive-button button'
        })
    ));
    el.getParent('.note-container').grab( el ); // Flip archived note to bottom
}

Note.unarchive = function ( el ) {
    el.getElement( '.archived-menu').dispose();
    el.removeClass( 'archived' );
}

Note.sortByDate = function ( el ) {
    var parent = el.getParent('.note-container');

    // Get array of notes from parent, separating archived and not archived
    var notes = parent.getElements('.note:not(.archived)');
    var archived = parent.getElements('.archived');

    var sortDesc = function ( first, second ) {
        return first.getElement('.title-date').get('text') <= second.getElement('.title-date').get('text');
    }

    var sortAsc = function ( first, second ) {
        return first.getElement('.title-date').get('text') > second.getElement('.title-date').get('text');
    }

    // Sort asc or desc depending on element order
    if ( Date.parse(notes[0].getElement('.title-date').get('text')) <
        Date.parse(notes.getLast().getElement('.title-date').get('text')) ) {
        // Sort desc
        notes.sort( sortDesc );
        archived.sort( sortDesc )
    } else {
        // Sort asc
        notes.sort( sortAsc );
        archived.sort( sortAsc )
    }

    // Clear parent and reenter sorted notes
    parent.erase( 'html' );
    notes.each( function( note ) {
        parent.grab( note );
    });

    // Then archived notes
    archived.each( function( note ) {
        parent.grab( note );
    });
}

// Will parse note text to add certain bits like url linking, that sort of thing
Note.parse = function ( text ) {
    var urlRegex = /https?:\/\/(www.)?[^\s"']+/gi;
    var finalText = text; // Ensure text is returned if nothing is found
    var match;
    var matches = [];

    // Replace link references with link tag so regex loop won't run over itself endlessly
    finalText = finalText.replace( urlRegex, '{link}' );

    // Then push link matches to array
    while ( match = urlRegex.exec( text ) )
        matches.push( match[0] );

    // Finally replace link references in sequence
    for ( match in matches )
        finalText = finalText.replace( '{link}', '<a href="' + matches[match] + '" target="_blank">' + matches[match] + '</a>' )

    // Process breaklines
    finalText = finalText.replace( /\n/g, '<br />' );

    return finalText;
}

// Will return text to original editor form for display in the edit box without markup
Note.deparse = function ( text ) {
    var finalText = text.replace( /<br>/g, "\n" );

    return finalText;
}