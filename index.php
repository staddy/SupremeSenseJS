<?php
    $doc = new DOMDocument();
    $doc->loadHTMLFile("index.html");
    echo $doc->saveHTML();
?>