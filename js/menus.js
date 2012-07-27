/**
 * @author: Tim Shaw
 * @date: 6/23/12
 * @time: 2:36 AM
 * @desc Mootools scripting for anything outside the main shell
 */

window.addEvent( 'domready', function () {
    // Window scroll listening event to update menu position
    var container = $(window);

    container.addEvent( 'scroll', function () {
        var scroll = container.getScrollLeft();

        // Scroll menu with bar
        $('menu').setStyles({
            left: scroll
        });

        // And also footer
        $('footer').setStyles({
            left: scroll
        });
    });

    $('footer').addEvent( 'click:relay(.zone-title-summary)', function ( event, el ) {
        var zoneEl = $('shell').getElement( "#" + el.get('alt'));
        /*var pos = zoneEl.getPosition().x;
        var finalPos = pos - ( ( $(window).getSize().x - zoneEl.getSize().x ) / 2 );

        var windowScroll = new Fx.Scroll( window, {
            duration: 600,
            wait: false
        }).start( finalPos, 0 );*/

        // Yeah, I totally did all the crap above before thinking "gee, I bet MT has a method for this already"
        // Sho' nuff -->

        var windowScroll = new Fx.Scroll( window, {
            duration: 600,
            wait: false
        }).toElementCenter( zoneEl, 'x' );
    });

    // Other tidbits

    // Clear note input on either click
    // 'contextmenu' == right click
    $('subnote').addEvents({
        'contextmenu' : function () {
            $('subnote').set( 'value', '' );
        },

        'click' : function () {
            $('subnote').set( 'value', '' );
        }
    });

    // Menu note element events
    $('menu').addEvent( 'click:relay(.subnote-close-button)', function ( event, el ) {
        el.getParent('.subnote').dispose();
        Shell.update();
    });

    // Search input
    $('s').addEvents({
        'contextmenu' : function () {
            $('s').set( 'value', '' );
        },

        'click' : function () {
            $('s').set( 'value', '' );
        },

        'keyup' : function () {
            // Only process search if there's more than one character
            if ( $('s').get('value').length > 1 ) {
                // Clear previous results
                $('search-note-container').set( 'html', '' );
                var results = Shell.search( $('s').get('value'), 3 );

                // Grab result notes
                results.notes.each( function (el) {
                    $('search-note-container').grab( el.clone() );
                });

                // Then result notes from subnote search
                results.subnotes.each( function (el) {
                    $('search-note-container').grab( el.clone() );
                });

                // Scroll to bottom
                var scroller = new Fx.Scroll( window ).toBottom();
            }
        }
    });

    // Setup.  Will attempt to load user bookmarks, otherwise will just present default setup
    // which can be saved in-session.

    // Some sort of user check to be added later
    if ( true ) {
        // Attempt to retrieve user bookmarks
        var shell = new Shell( 'shell', 'tim', {

        });
    } else {
        var shell = new Shell( 'shell', null, {

        });
    }

    // Button delegations, needed because elements are dynamically loaded in

    // Add new subnote functionality

    var keyboardHook = new Keyboard(); // Set up keyboard crap

    var sendNewSubnote = function () {
        var newSubnote = new Subnote( 'new-subnote-container', {
            text: $('subnote').get( 'value' )
        });
        keyboardHook.deactivate();
        hideAddSubnote();
    }

    $(window).addEvent( 'click:relay(div.add-new-subnote-button)', function ( event, el ) {
        // Set note element to appropriate offset for scroll
        $('add-new-subnote-container').setStyles({
            left: $(window).getScrollLeft()
        });

        keyboardHook.addEvents({
            'enter': sendNewSubnote
        }).activate();

        showAddSubnote();
    });

    // Send new subnote

    $('send-subnote').addEvent( 'click', function () {
        sendNewSubnote();
    });

    // Subnote close button

    $('add-new-subnote-close-button').addEvent( 'click', function () {
        hideAddSubnote();
    });

    // Add new note/zone

    $('new-zone-button').addEvent( 'click', function () {
        shell.addUnit();
        Shell.update();
    });

    // Undo button

    $('undo-button').addEvent( 'click', function () {
        shell.undo();
    });

    // Redo button

    $('redo-button').addEvent( 'click', function () {
        shell.redo();
    });

    // Go left

    $('go-left').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toLeft();
    });

    // Go right

    $('go-right').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toRight();
    });

    // Go down

    $('go-down').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toBottom();
    });

    // Go up

    $('go-up').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toTop();
    });

    // Funks

    function showAddSubnote () {
        $('add-new-subnote-container').set( 'morph', {
            duration: 150,
            transition: "sine:out"
        });

        $('add-new-subnote-container').setStyle( 'display', 'block' );

        $('add-new-subnote-container').morph({
            opacity: 1
        });

        // Set vertical float
        $('add-new-subnote').setStyle( 'margin-top', ($(window).getSize().y - $('add-new-subnote').getSize().y) / 2 );
    }

    function hideAddSubnote () {
        $('add-new-subnote-container').morph({
            opacity: 0.0
        });

        (function () {
            $('add-new-subnote-container').setStyle( 'display', 'none' );
        }).delay( 150 );
    }
});
