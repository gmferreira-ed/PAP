


// PASSWORD REVEALING

var PasswordRevealers = document.querySelectorAll(".password-button")
PasswordRevealers.forEach(RevealButton => {
    let IsRevealed = false
    let parentContainer = RevealButton.parentElement
    let passwordInput = parentContainer.querySelector("input")
    let passwordIcon = parentContainer.querySelector("img")

    RevealButton.addEventListener("click", function(){
   
        if (IsRevealed){
            passwordInput.type = "password"
            passwordIcon.src = "../Images/Icons/notvisible.svg"
        }else{
            passwordInput.type = "text"
            passwordIcon.src = "../Images/Icons/visible.svg"
        }

        IsRevealed = !IsRevealed
        
    })
});

var PageChangers = document.querySelectorAll("[page-link]")
PageChangers.forEach(PageChanger => {
    let link = PageChanger.getAttribute('page-link')
    PageChanger.addEventListener('click', function(){
        ShowLoader()
        window.location.href = link
    
    })
    
    if (window.location.href.includes(link)){
        PageChanger.style.backgroundColor = "rgb(78, 78, 78)"
    }
})