import  config  from './configurations.js';
import DatabaseService from './DatabaseService.js';
import ComponentTypes from './ComponentTypes.js';
import { tonumber } from './common.js';

var DB = new DatabaseService("restaurante")

var GlobalComponentsData = config.GlobalComponentsData

var Boards = []
const ContextMenu = document.getElementById("component-context-menu")
var DraggingTable
var SelectedComponent
var SelectedBoard
var Resizing
var ResizeHandle
// GLOBALS

const zoomSpeed = 1.1;
const minScale = 1;
const maxScale = 3;


export class BoardClass {

    // PRE CONSTRUCTOR

    CurrentGridSize = 10
    ComponentsData = []
    OrderedComponents = []

    DraggingLayout = false;

    startPos = { x: 0, y: 0 };
    currentTranslate = { x: 0, y: 0 };
    CurrentZoom = 1;

    LayoutOffsetX = 0
    LayoutOffsetY = 0
   

    



    constructor(Board){
        this.Board = Board
        this.BoardContainer = Board.parentElement
        this.ContainerSize = {x:this.BoardContainer.clientWidth, y:this.BoardContainer.clientHeight}
        this.DfRect = Board.getBoundingClientRect()
        Boards[BoardContainer.id] = this

        

        this.init()
    }

    UpdateSnapping(NewValue){
        config.Snapping = NewValue
        const bcsize = NewValue+"%"+NewValue+"%"
        Board.style.backgroundSize = bcsize
    }

    // COMPONENTS
    async CreateComponent(ClassName, StoredData){

        const ClassInfo = ComponentTypes[ClassName]
        let Component = document.createElement("div")
        Component.classList.add("Component");
        Component.id = this.OrderedComponents.length

        
      
        
        
        Component.style.width = this.CurrentGridSize + "%"
        Component.style.height = this.CurrentGridSize + "%"
        Component.staticWidth = this.CurrentGridSize
        Component.staticHeight = this.CurrentGridSize


        var ComponentData = {
            Instance: Component
        }

        this.ComponentsData[Component.id] = ComponentData
        GlobalComponentsData[Component.id] = ComponentData
        this.OrderedComponents.push(Component.id)
   
       
        BoardContainer.appendChild(Component);

    

        if (StoredData){
            Component.PrimaryKey = StoredData.componentid
            Component.style.left = StoredData.left+"%"
            Component.style.top = StoredData.top+"%"
            Component.style.width = StoredData.width+"%"
            Component.style.height = StoredData.height+"%"
        }else{
        
            var resultado = await DB.Set("layout", {
                top:Component.style.top,
                left:Component.style.left,
                width:Component.style.width,
                height:Component.style.height,
                type:ClassName
            })
            Component.PrimaryKey = resultado.insertId
        
        }



        let StyleDiv = document.createElement("div")
        if (ClassName){
            StyleDiv.classList.add(ClassName);
        }
    
        Component.appendChild(StyleDiv);

        Component.StyleDiv = StyleDiv
        if (ClassInfo.constructor){
            ClassInfo.constructor(StyleDiv)
        }

        SaveInfo(Component, true)

        this.ConnectComponent(Component)

        return Component
    }

    ConnectComponent(Component, ComponentData) {

        // Comecar drag
        var ComponentData = this.ComponentsData[Component.id]
    
        Component.addEventListener('contextmenu', (e) => {
            
            e.preventDefault()

            SelectedBoard = this
            SelectedComponent = Component
            ContextMenu.style.display = "flex"
            ContextMenu.style.left = e.clientX+"px"
            ContextMenu.style.top = e.clientY+"px"
        })
    
        Component.StyleDiv.addEventListener('mousedown', (e) => {
            if (e.which == 1){
                DraggingTable = Component


                Component.InputStartX = e.clientX;
                Component.InputStartY = e.clientY;
                Component.style.cursor = 'move';
            }
            
        });
    }

    DestroyComponent(Component){
        const PrimaryKey = Component.PrimaryKey
        const DeletedId = Component.id

        this.selectionbox.style.display = "none"
        document.body.appendChild(this.selectionbox)
        Component.remove()
        delete this.ComponentsData[Component.id]
        delete GlobalComponentsData[Component.id]

        DB.Set('layout', null, 'componentid = '+PrimaryKey)
    }









    async init(){

        // LOAD LAYOUT
        var SavedComponents = await DB.Get("layout")
        SavedComponents.forEach(element => {
            const TableComp = this.CreateComponent(element.type, element)
        });



        // SELECTION BOX CREATION

        let selectionbox = document.createElement("div")
        selectionbox.id = "selection-box"
        selectionbox.classList.add("selection-box");

        let handletop = document.createElement("div")
        handletop.className = ("dragger size-handle-top");
        let handlebot = document.createElement("div")
        handlebot.className = ("dragger size-handle-bottom");
        let handleleft = document.createElement("div")
        handleleft.className = ("dragger size-handle-left");
        let handleright = document.createElement("div")
        handleright.className = ("dragger size-handle-right");

        let rotatehandle = document.createElement("div")
        rotatehandle.className = ("dragger rotate-handle");


        selectionbox.appendChild(handlebot)
        selectionbox.appendChild(handleleft)
        selectionbox.appendChild(handleright)
        selectionbox.appendChild(handletop)
        selectionbox.appendChild(rotatehandle)
        document.body.appendChild(selectionbox);
       
        
        
        function ConnectHandle(Handle){
            Handle.addEventListener('mousedown', (e) => {
                SelectedComponent.InputStartX = e.clientX;
                SelectedComponent.InputStartY = e.clientY;
                ResizeHandle = Handle
                Resizing = SelectedComponent
            })
        }
        ConnectHandle(handlebot)
        ConnectHandle(handleleft)
        ConnectHandle(handleright)
        ConnectHandle(handletop)
        
        this.selectionbox = selectionbox




        
        // BOARD DRAGGING
        BoardContainer.addEventListener('mousedown', (e) => {
            if (!DraggingTable && !Resizing){
                this.DraggingLayout = true;
           
                const currentLeft = parseFloat(getComputedStyle(BoardContainer).left) || 0;
                const currentTop = parseFloat(getComputedStyle(BoardContainer).top) || 0;
                this.LayoutOffsetX = e.clientX - currentLeft;
                this.LayoutOffsetY = e.clientY - currentTop;
            }
        });


        

       function GetLimits(DfRect, TargetLeft, TargetTop) {
            var Rect = Board.getBoundingClientRect()
            let MinLeft = DfRect.width - Rect.width
            let MinTop = DfRect.height - Rect.height
            TargetLeft = Math.max(MinLeft, Math.min(TargetLeft, 0))
            TargetTop = Math.max(MinTop, Math.min(TargetTop, 0))

            return {TargetLeft, TargetTop}
        }

        function PositionToMouseX(Component, MouseX){
            var ContainerRect = Board.getBoundingClientRect()

            let InputStartX = Component.InputStartX
            let StaticX = Component.StaticPosition.Absolute.X


            var TargetLeft = ((MouseX- (InputStartX-StaticX)) / ContainerRect.width)*100
            TargetLeft = Math.round(TargetLeft/config.Snapping) * config.Snapping
            Component.style.left = TargetLeft + '%';
        }

        function PositionToMouseY(Component, MouseY){
            var ContainerRect = Board.getBoundingClientRect()

            let InputStartY = Component.InputStartY
            let StaticY = Component.StaticPosition.Absolute.Y

            var TargetTop = ((MouseY- (InputStartY - StaticY)) / ContainerRect.height)*100
            TargetTop = Math.round(TargetTop/config.Snapping) * config.Snapping
            Component.style.top = TargetTop + '%';
        }
      
        // COMPONENT POSITIONING AND RESISIZING
        document.addEventListener('mousemove', (e) => {
            var ContainerRect = Board.getBoundingClientRect()

            let MouseX = e.clientX
            let MouseY = e.clientY


            if (DraggingTable) {
                let Component = DraggingTable
                
                PositionToMouseX(Component, MouseX)
                PositionToMouseY(Component, MouseY)
            }else if(Resizing){

                // COMPONENT RESIZING
                let Component = Resizing
                let InputStartX = Component.InputStartX
                let InputStartY = Component.InputStartY

                let AbsoluteStaticPos = Component.StaticPosition.Absolute
                let ScaleStaticPos = Component.StaticPosition.Scale

                let DifferenceX = ((MouseX- InputStartX) / ContainerRect.width)*100
                let DifferenceY = ((MouseY- InputStartY) / ContainerRect.height)*100
               

                let Snapping = config.Snapping
            

                if (MouseX<AbsoluteStaticPos.X && ResizeHandle == handleleft){
                    let TargetLeft = ScaleStaticPos.X+DifferenceX
                    Component.style.left = (Math.round(TargetLeft/config.Snapping)*config.Snapping)+"%"
                    DifferenceX*=-1
                }else{
                    Component.style.left = ScaleStaticPos.X+"%"
                }
                if (MouseY<AbsoluteStaticPos.Y && ResizeHandle == handletop){
                    let TargetTop = ScaleStaticPos.Y+DifferenceY
                    Component.style.top = (Math.round(TargetTop/config.Snapping)*config.Snapping)+"%"
                    DifferenceY*=-1
                }
                else{
                    Component.style.top = ScaleStaticPos.Y+"%"
                }
             
                
                DifferenceX = Math.round((Component.staticWidth + DifferenceX)/config.Snapping) * config.Snapping
                DifferenceY = Math.round((Component.staticHeight + DifferenceY)/config.Snapping) * config.Snapping


                Component.style.width =  Math.max(Snapping,DifferenceX) + '%';
                Component.style.height = Math.max(Snapping,DifferenceY) + '%';
                
            }else if (this.DraggingLayout){
            
                
          
                let DragLeftPos = e.clientX - this.LayoutOffsetX
                let DragTopPos = e.clientY - this.LayoutOffsetY
                let DfRect = this.DfRect

                let {TargetLeft, TargetTop} = GetLimits(DfRect,DragLeftPos, DragTopPos)

                BoardContainer.style.left = TargetLeft + 'px'
                BoardContainer.style.top = TargetTop + 'px'

           }
        });

       
        document.addEventListener('mouseup', () => {
            this.DraggingLayout = false;
        });

        // BOARD ZOOMING
        document.addEventListener('wheel', (e) => {
            if (!DraggingTable){
                var delta = Math.sign(-e.deltaY);
           
            if (delta>0){
                this.CurrentZoom = this.CurrentZoom * delta * zoomSpeed;
            }else{
                delta = Math.abs(delta)
                this.CurrentZoom = this.CurrentZoom /( delta * zoomSpeed);
            }
            
          
            this.CurrentZoom = Math.min(Math.max(this.CurrentZoom, minScale), maxScale);
            var TargetZoom = 100*this.CurrentZoom
            
            BoardContainer.style.width = TargetZoom+"%"
            BoardContainer.style.height = TargetZoom+"%"

            
            let ZoomMult = -(TargetZoom/100-1)


            let LeftZoom = (e.clientX-this.DfRect.x)*ZoomMult
            let TopZoom = (e.clientY-this.DfRect.y)*ZoomMult
           
            let {TargetLeft, TargetTop} = GetLimits(this.DfRect, LeftZoom, TopZoom)

            BoardContainer.style.left = TargetLeft+"px"
            BoardContainer.style.top = TargetTop+"px"
            }
            }
        );


       

        

        this.UpdateSnapping(config.Snapping)
    }
}






function SaveInfo(Component, LocalOnly){
    const parent = Component.parentElement;
    const CompRect = Component.getBoundingClientRect()
    Component.staticWidth = tonumber(Component.style.width)
    Component.staticHeight = tonumber(Component.style.height)

    console.log("Saving componenet info.")

    Component.StaticPosition = {
        Absolute: {
            X:CompRect.x,
            Y:CompRect.y
        },
        Scale: {
            X:tonumber(Component.style.left),
            Y:tonumber(Component.style.top)
        }
    }
    if (!LocalOnly){
        DB.Set("layout", {
            componentid:Component.PrimaryKey,
            top:Component.style.top,
            left:Component.style.left,
            width: Component.style.width,
            height: Component.style.height,
        })
    }
}






function Select(Component){
    var selectionbox = document.getElementById('selection-box')
    SelectedComponent = Component
    Component.appendChild(selectionbox)
    selectionbox.style.display = "block"
}


// SAVING INFO ON MOUSE UP
document.addEventListener('mouseup', (e) => {
    var selectionbox = document.getElementById('selection-box')
    const Component = DraggingTable || Resizing
    if (Component) {
        Component.style.cursor = '';
        SaveInfo(Component)
        Select(Component)
    }else{
        selectionbox.style.display = "none"
    }
    ContextMenu.style.display = "none"
    DraggingTable = false
    Resizing = false
});

var DeleteButton = document.getElementById("delete")
DeleteButton.addEventListener('click', function(e) {
    if (SelectedComponent){
        SelectedBoard.DestroyComponent(SelectedComponent)
        ContextMenu.style.display = "none"
    }
})


