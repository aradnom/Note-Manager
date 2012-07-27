// Class for creating a subnote (chunk of text) which can be grabbed and dropped on to existing notes
// or extracted

var Subnote = new Class ({
	Implements : [Options],
	
	options : {
	},
	
	initialize : function ( container, data, options ) {
		if ( typeof( data ) == undefined ) // Don't bother if no data was sent
			return false;
		
		this.setOptions( options );
        this.container = $(container);

        // Process subnote data
        this.text = data.text;
        this.date = data.date;
        this.status = data.status;

        // Process subnote and kick it out the door
        this.createSubnote();
	},

    // Builds subnote from supplied info.  Assumes subnote info is sent with constructor
    buildSubnote : function () {
        var that = this;

        // Set current date
        if ( !this.date ) {
            var date = new Date();
            this.date = this.formatDate( date );
        }

        this.element = new Element( 'div.subnote');

        // Subnote date
        this.element.grab( new Element( 'div.subnote-date-container', {
                html: this.date
            })
        );

        // Highlight element, need to be separate as border won't display correctly
        this.element.grab( new Element( 'div.subnote-highlight' ) );

        // Then put subnote contents
        this.element.grab( new Element( 'div.subnote-contents', {
            html: this.text
        }));

        // Add subnote menu and buttons
        this.element.grab( new Element( 'div.subnote-menu' ).
            grab( new Element( 'div.subnote-close-button' )));

        // Status element
        this.element.grab( new Element( 'div', {
            class: this.status ? this.status : 'subnote-status not-done'
        }));

        // Add hidden text field for referencing
        this.element.grab( new Element( 'input.full-text', {
            type: "hidden",
            value: this.text
        }));
    },

    // Builds subnote, adds effects and grabs to container element once subnote data is defined
    createSubnote : function () {
        this.buildSubnote();
        this.addEffects( this.element );
        this.container.grab( this.element );
    },
	
	// Binds hover effects to subnote
	addEffects : function ( el ) {
		var that = this;
        var rolloutTimer;

        /*var subnoteMenuRollout = function ( el ) {
            that.showSubnoteMenu();

            // Clear periodical
            clearInterval( rolloutTimer );
        }

        // Standalone morph because el.morph doesn't play well with others
        var subnoteHover = new Fx.Morph( el, {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });
		
		// Hover events
		el.addEvents({
			mouseover: function () {
                rolloutTimer = subnoteMenuRollout.periodical( 500, this, el );
			},
			
			mouseout: function () {
                clearInterval( rolloutTimer );
			}
		});*/
		
		// Drag event

		var subnoteDrag = new Drag.Move( el, {
			droppables: '.note',

            stopPropagation: true, // Make sure child drag doesn't trigger parent (chain) drag
			
			onStart: function (el, event) {
				// Set parent z-index higher than all others so subnote is always above other containers
                if ( el.getParent( '.note-zone' ) )
				    el.getParent( '.note-zone' ).setStyle( 'z-index', 2 );

                if ( el.getParent('.note') )
                    el.getParent('.note').setStyle( 'z-index', 2 );

                // Update droppable list as it might have/probably changed
                this.droppables = $$('.note');
			},
			
			onDrop: function ( el, droppable, event ) {
				// If droppable exists, make new drop element
				if ( droppable && droppable != el.getParent( '.chain' ) ) {
					// Reset parent element to default z-index before making new element
                    if ( el.getParent( '.note-zone' ) )
					    el.getParent( '.note-zone' ).setStyle( 'z-index', 1 );

                    if ( el.getParent('.note') )
                        el.getParent('.note').setStyle( 'z-index', 1 );
					
					// Attach new element to droppable and delete old element
					droppable.getElement( '.note-subnote-container' ).grab( el, 'top' );

                    // Reset positioning, otherwise moo will attempt to position it from where it was last
                    el.setStyles({
                        left: 0,
                        top: 0
                    });

                    // Update bookmarks in database
                    Shell.update();
				} else {
					// Otherwise just snap back to origin
					el.set( 'morph', {
						duration: 500,
						transition: 'elastic:out',
                        link: 'cancel'
					});
					
					el.morph({
						top: 0,
						left: 0
					});
				}
			},
		 
			onEnter: function ( element, droppable ) {
				//To be used later
			},
		 
			onLeave: function ( element, droppable ) {
				//same as above
			}
		});
	},

    hideSubnoteMenu : function () {
        // Placed in index event delegation, works very strangely if placed here
    },

    showSubnoteMenu : function () {
        var subnoteMenu = this.element.getElement('.subnote-menu');

        subnoteMenu.set('morph', {
            duration: 100,
            transition: 'sine:out'
        });

        subnoteMenu.morph({
            opacity: 1
        });
    },
	
	getElement: function () {
		if ( typeof( this.element ) != 'undefined' )
			return this.element;
	},

    // Returns formatted date string
    // Have to do this so you actually get something sane
    // because the default formatting CAN'T BE READ BY PEOPLE
    formatDate: function ( date ) {
        var hours = ( date.getHours() % 12 ) == 0 ? 12 : date.getHours() % 12;
        var am_or_pm = date.getHours() > 11 ? 'pm' : 'am';
        var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

        return (date.getMonth() + 1) + "/" +
            date.getDate() + ' - ' +
            hours + ":" +
            minutes +
            am_or_pm;
    }
});