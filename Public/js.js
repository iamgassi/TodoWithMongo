var inputfield=document.getElementById("input");
var main=document.getElementById("main");
var leftside=document.getElementById("leftside");

start();
function start() {
       getAllData(function(receiveData)
       {
        if(receiveData!=null)
        {
            console.log(receiveData)
         inputfield.innerHTML = "";    
        receiveData.forEach(function(task){
            // console.log(task)
            onScreen(task);
        })
        }
        else{
            receiveData=[]
        }
       });
    }

    function getAllData(allData){   
    let request = new XMLHttpRequest();
    request.open("GET","/todos");   
    request.setRequestHeader("Content-type","application/json");
    request.addEventListener("load",function(){
       allData(JSON.parse(request.responseText));
    })
     request.send();
    }

   inputfield.addEventListener("keyup",handler);

   function handler(event){

    if(event.code=="Enter" && inputfield.value!="")
     {
          data = { title: inputfield.value, status: "Pending", id: Date.now() }
         var body=JSON.stringify(data);
         var req=new XMLHttpRequest();
        
         req.open("post","/todos");
          req.setRequestHeader("Content-type","application/json");
         req.send(body);
         req.addEventListener("load",function()
         {
            onScreen(data);
           inputfield.value="";
         })   
       
     }
   }

    function onScreen(task){
       console.log("inside on screen");
    var container=document.createElement('div');
    container.setAttribute('id','container')
   // container.setAttribute('id',task.taskid);
    var newtask=document.createElement("span")
    newtask.innerHTML=task.title;
    newtask.id=task.id;
    newtask.style.fontSize="20px";
    newtask.style.color="black";
    newtask.style.fontWeight="bolder";

   var status=document.createElement('span');
   status.innerHTML=task.status;
    
    var div2=document.createElement("div");
    var check=document.createElement('input')
    check.setAttribute("type","checkbox")


      if (task.status == "Completed") {
            check.checked = true;
            // status.setAttribute("class",'text-success')
        newtask.style.textDecoration = "line-through";
    }
    else{
                task.status="Pending";
                // console.log(check)
                //    status.setAttribute("class",'text-danger')
                newtask.style.textDecoration="none";
                // updatestatus(task.id);
            }
    check.onchange = statusUpdate(task)


    var edit=document.createElement("i")
    edit.classList.add("fa-solid","fa-pen")
    edit.style.cursor="pointer";
    edit.style.marginLeft="4px"
    // deleteimg.addEventListener("click",
    //   deletetask(task)
    // )
      edit.onclick=editTask(task)
     
    var deleteimg=document.createElement("i")
    deleteimg.classList.add("fa-regular","fa-trash-can")
    deleteimg.style.cursor="pointer";
    deleteimg.style.marginLeft="4px"
    // deleteimg.addEventListener("click",
    //   deletetask(task)
    // )
      deleteimg.onclick=deletetask(task)

    
    

   container.appendChild(newtask)
    // container.appendChild(status)
   div2.appendChild(check)
   div2.appendChild(edit)
   div2.appendChild(deleteimg) 
   container.appendChild(div2)

   main.appendChild(container);

   container.style.display="flex";
   container.style.justifyContent="space-between";
   container.style.padding="5px";
   container.style.marginTop="3px";
   container.style.marginLeft="3px";
   container.style.marginRight="5px";
  
   check.style.marginRight="5px";
   check.style.marginTop="6px"; 
  
   deleteimg.style.marginRight="10px";
   deleteimg.style.cursor="pointer";
   
}

function deletetask(todo) {
    return function (event) {
        var request = new XMLHttpRequest();
        data = { id: todo.id };
        request.open("post", "/delete");
        request.setRequestHeader("Content-type", "application/json");
        request.send(JSON.stringify(data));
        request.addEventListener("load", function () {
            var item = event.target.parentElement.parentElement;
            main.removeChild(item)
        })
    }
}

function editTask(todo){
    return function(event){
         const edited=prompt("Please Enter Value")
         console.log(edited)
         if(!edited) return;
         var click = event.target;
         var request=new XMLHttpRequest();
         request.open('post','updateTask');
         data = { id: todo.id , title:edited }
         request.setRequestHeader("Content-type","application/json")
         request.send(JSON.stringify(data))
         request.addEventListener('load',function(){
            var listItem = click.parentElement.parentElement;
            var child = listItem.childNodes;
            child[0].innerText=edited;
         })
    }
}

function statusUpdate(todo) {
    return function (event) {
        var click = event.target;
        var request = new XMLHttpRequest();
        request.open("post", "/updated");

        var controls = click.parentElement;
        var check = controls.firstChild;
        if(check.checked)
        {
            data = { id: todo.id , status:'Completed' }
        }
        else{
            data = { id: todo.id , status:'Pending' }

        }
        request.setRequestHeader("Content-type", "application/json");
        request.send(JSON.stringify(data));
        request.addEventListener("load", function () {
            var listItem = click.parentElement.parentElement;
            var targetText = listItem.firstChild;
            var controls = click.parentElement;
            var check = controls.firstChild;
            var child = listItem.childNodes;
    
            if (check.checked) {
             //   console.log( child[1])
                //  child[1].innerHTML="Completed"
                //  child[1].setAttribute("class",'text-success')
                targetText.style.textDecoration = "line-through"
            }
            else {
              //   console.log( child[1])
                // child[1].innerHTML="Pending"
                //  child[1].setAttribute("class",'text-danger')
                targetText.style.textDecoration = 'none'
            }
        })
    }
}

