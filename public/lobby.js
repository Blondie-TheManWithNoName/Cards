

document.getElementById("join-button").addEventListener("click", () => 
{
    console.log("HELLO")
    document.getElementsByClassName("lobby-container-btn")[0].style.transform = "translateY(-60vh)";
});

document.getElementById("back-button").addEventListener("click", () => 
{
    console.log("HELLO")
    document.getElementsByClassName("lobby-container-btn")[0].style.transform = "translateY(0vh)";
});

document.getElementById("roomNumber").addEventListener("onkeydown", (key) => 
{
    console.log("KEY: ", key)
});


window.onload = (event) => {

    console.log("Page is fully loaded");
  };
