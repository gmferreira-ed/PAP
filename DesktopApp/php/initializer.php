<?php
    $isadmin = false;
    if ($_SESSION["access_level"] == "admin"){
        $isadmin = true;
    }

    $isself = false;
    if (isset($_GET["id"]) && $_SESSION["userid"] == $_GET["id"]){
        $isself = true;
    }
?>

<script>
    let isadmin = "<?php echo $isadmin; ?>"
    let isself = "<?php echo $isself; ?>"

    document.addEventListener('DOMContentLoaded', function() {
        var AdminComponents = document.querySelectorAll("[admin-component]")

        AdminComponents.forEach(Comp => {
            if (!isadmin){
                Comp.style.display = "none";
            }
        });

        var ManagerComponents = document.querySelectorAll("[manager-component]")

        ManagerComponents.forEach(Comp => {
            if (!isself && !isadmin){
                Comp.style.display = "none";
            }
        });
    })
   
</script>