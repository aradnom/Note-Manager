<?php
/**
 * @author Tim Shaw
 * @date 5/29/12
 * @description Class responsible for persisting bookmark data to and from database
 */

require_once( "../inc/defines_and_functions.php" );
require_once( "../inc/MongoMe.class.php" );

// Upload new changes if bookmarks is set
if ( isset( $_POST['bookmarks'] ) ) {
    //$bookmarks = new stdClass;
    $snapshots = array();
    $newSnapshot = json_decode( $_POST['bookmarks'], true );

    // Return immediately if snapshot is empty
    if ( !isset( $newSnapshot ) || empty( $newSnapshot ) ) {
        echo  '{"error":' . '"' . 'Empty snapshot' . '"' . '}';
        return false;
    }

    update_bookmarks_mongo( $newSnapshot, $_POST['lastupdate'] );

// Read current bookmarks if user is set
} elseif ( isset( $_POST['user'] ) ) {
    read_bookmarks_mongo( $_POST['level'] );
}

// Functions for processing snapshots

function read_bookmarks_mongo ( $level ) {
    include( "../inc/auth.php" );

    $mongo = new MongoMe( $database, $user, $pass, $collection );

    // Retrieve user bookmarks from db
    $bookmarks = $mongo->findOne( array( 'user' => USER ), array( 'snapshots' => 1 ) );

    // Send top (newest) snapshot back if nothing went wrong
    if ( $bookmarks )
        if ( empty( $bookmarks ) || empty( $bookmarks['snapshots'][$level] ) )
            echo  '{"error":' . '"' . "No bookmarks to retrieve" . '"' . ', "code":' . '"' . $mongo->getErrorCode() . '"' . '}';
        else
            echo json_encode( $bookmarks['snapshots'][$level] );
    else
        echo  '{"error":' . '"' . $mongo->getError() . '"' . ', "code":' . '"' . $mongo->getErrorCode() . '"' . '}';
}

function update_bookmarks_mongo ( $newSnapshot, $lastUpdate ) {
    include( "../inc/auth.php" );

    $mongo = new MongoMe( $database, $user, $pass, $collection );

    $currentSnapshots = $mongo->findOne( array( 'user' => USER ), array( 'snapshots' => 1 ) );

    // Compare last timestamp with top retrieved one to make sure it was this client that sent it
    if ( is_numeric( $lastUpdate ) )
        if ( $currentSnapshots['snapshots'][0]['time'] != $lastUpdate ) {
            echo json_encode( array( "error" => "Newer time already exists.  Please refresh and try again." ) );
            exit();
        }

    // Set time of new snapshot and push to array so newest always at top
    $newSnapshot['time'] = time();

    $snapshots[] = $newSnapshot;

    // Populate remaining snapshots using top 4 so snapshots will always be ordered
    // newest --> oldest without shuffling anything
    if ( !empty( $currentSnapshots['snapshots'] ) )
        foreach ( array_slice( $currentSnapshots['snapshots'], 0, SNAPSHOT_LIMIT - 1 ) as $snapshot ) {
            $snapshots[] = $snapshot;
        }

    // Send updated snapshots to db
    $success = $mongo->update( null, array( 'user' => 'tim' ), array( 'snapshots' => $snapshots ), false, array( 'safe' => true ) );

    // Return timestamp if successful
    if ( $success )
        echo json_encode( array( "timestamp" => $newSnapshot['time'] ) );
    else
        echo  '{"error":' . '"' . $mongo->getError() . '"' . ', "code":' . '"' . $mongo->getErrorCode() . '"' . '}';
}