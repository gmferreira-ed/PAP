
import "../GlobalFunctions.js"
import "../initializer.js"

function Layout(){
    return (
        <div class="layout">
            <div class="navbar" id="side-navbar">
                <div class="navbar-icon">
                    <img  src="../Images/RestroLink.png"></img>
                </div>
                <button class="navbar-button"  page-link='home.jsx'>
                    <img src="../Images/Icons/home.svg" class="nav-button-icon" ></img>
                    <span class="nav-button-label">Home</span>
                </button>
                <span class="separator" style=""></span>
                <button class="navbar-button"  page-link='finances.php'>
                    <img src="../Images/Icons/finances.svg" class="nav-button-icon"></img>
                    <span class="nav-button-label">Finances</span>
                </button>

                
            
                <button class="navbar-button"  page-link='calendar.php'>
                    <img src="../Images/Icons/calendar.svg" class="nav-button-icon"></img>
                    <span class="nav-button-label">Calendar</span>
                </button>


                <button class="navbar-button"  page-link='menu.php'>
                    <img src="../Images/Icons/menu.svg" class="nav-button-icon"></img>
                    <span class="nav-button-label">Menu</span>
                </button>

                <button class="navbar-button"  page-link='stocks.php'>
                    <img src="../Images/Icons/stocks.svg" class="nav-button-icon"></img>
                    <span class="nav-button-label">Stocks</span>
                </button>

                <span class="separator"></span>
            
                <button class="navbar-button" page-link='users.php'>
                    <img src="../Images/Icons/group.svg" class="nav-button-icon"></img>
                    <span class="nav-button-label">Users</span>
                </button>
                
                <button class="navbar-button" page-link='settings.php'>
                    <img src="../Images/Icons/settings.svg" class="nav-button-icon"></img>
                    <span class="nav-button-label">Settings</span>
                </button>
            </div>

            <div class="container"></div>
        </div>
    )
}


export default Layout;







    



