<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Me
 * Date: 7/31/12
 * Time: 10:05 PM
 * To change this template use File | Settings | File Templates.
 */

include( "../inc/auth.php" );
require_once( "../inc/defines_and_functions.php" );
require_once( "../inc/MongoMe.class.php" );

$mongo = new MongoMe( $database, $user, $pass, $collection );

$currentSnapshots = $mongo->findOne( array( 'user' => USER ), array( 'snapshots' => 1 ) );

print_r( $currentSnapshots['snapshots'][0]['time'] );