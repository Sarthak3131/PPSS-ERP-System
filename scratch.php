<?php
try {
    app('session')->regenerate();
    echo "Session regenerated successfully.\n";
} catch (\Exception $e) {
    echo $e->getMessage() . "\n";
}
