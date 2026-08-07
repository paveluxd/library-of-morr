//MAP
class GameMap{
    constructor(){
        this.buildings = {}
        this.buildMode = false
        this.focusedBuilding = null

        //Stores trees
        this.environmentObjects = {}
        
        //MAP css
        this.mapElem = el('map')
        this.cellSize = 12
        this.gridWidth = 160


        //Set map width
        this.mapElem.setAttribute('style', `
            width: ${this.gridWidth * this.cellSize}px;
        `)

        //Set background layer width based on map width
        el('map-environment').setAttribute('style', `
            width: ${this.gridWidth * this.cellSize}px;
        `)

        this.scrollToMapCenter()
    }


    //Buildings
    build(buildingType, buildingRefObj){
        let newBuildingObj

        //Prebuild
        if(buildingRefObj){
            newBuildingObj = new Building(buildingType, buildingRefObj)
        }

        //New building
        else{
            newBuildingObj = new Building(buildingType)
            genBuildingHtmlElem(newBuildingObj)
        }


        //Add building to map obj
        this.buildings[newBuildingObj.id] = newBuildingObj
    }


    //Utility
    scrollToMapCenter(){
        let wrapper = el('map-scroll-box')
        wrapper.scrollLeft = (wrapper.scrollWidth - window.innerWidth) / 2
        wrapper.scrollTop = (wrapper.scrollHeight - window.innerHeight) / 2
    }


    //Set environment decorations
    setMapDecoration(){

        //Assign reference env object
        let rootRefObj

        //LOAD decorations
        if(g.gameMap.envDecorations != undefined &&  Object.keys(g.gameMap.envDecorations).length !== 0) {
            
            //Set reference object
            rootRefObj = g.gameMap.envDecorations
            // console.log('Saved env ref:', rootRefObj)

            //Per sprite group
            for(let key in rootRefObj) {

                //Create containers.
                let envContainer = document.createElement('div');
                envContainer.id = `${key}-container`;
                //Class
                envContainer.classList.add('envContainer')


                //Add sprites to container
                if (key === 'sky') {
                    //Add sun
                    let sun = document.createElement('img');
                    sun.setAttribute('src', './03-IMG/bg/sun-1.svg');
                    sun.classList.add('sun')
                    envContainer.append(sun)
                }


                //Shuffle position coordinates once
                if (rootRefObj[key].absoluteCoords != undefined) {
                    shuffle(rootRefObj[key].absoluteCoords)
                }

                //Generate sprites
                for (let i = 0; i < Object.keys(rootRefObj[key].sprites).length; i++) {

                    let sprite = rootRefObj[key].sprites[Object.keys(rootRefObj[key].sprites)[i]]

                    // console.log('loading sprite')
                    // console.log(sprite)

                    //Append sprite
                    envContainer.append(this.genEnvElemHtml(sprite))
                }

                //Append container
                el('map-environment').appendChild(envContainer);
            }
        }

        //NEW decorations
        else {
            this.envDecorations = {}
            rootRefObj = envDecorationsRef
            // console.log('New env ref:', rootRefObj)

            for(let key in rootRefObj) {
                //Add sprites object to stored ref object once per key
                this.envDecorations[key] = {sprites: {}}

                //CONTAINER: Create
                let envContainer = document.createElement('div');
                envContainer.id = `${key}-container`;
                envContainer.classList.add('envContainer')

                //SPRITE: Add sun
                if (key === 'sky') {
                    //Add sun
                    let sun = document.createElement('img');
                    sun.setAttribute('src', './03-IMG/bg/sun-1.svg');
                    sun.classList.add('sun')
                    envContainer.append(sun)
                }

                //SPRITE: Shuffle position coordinates once
                if (rootRefObj[key].absoluteCoords != undefined) {
                    shuffle(rootRefObj[key].absoluteCoords)
                }

                //SPRITE: Generate
                for (let i = 0; i < rng(envDecorationsRef[key].elementQuantity[0], envDecorationsRef[key].elementQuantity[1]); i++) {

                    //Append sprite
                    envContainer.append(
                        this.genEnvElemHtml(
                            this.genEnvElemObj(key, i)
                        )
                    )
                }

                //CONTAINER: Append
                el('map-environment').appendChild(envContainer);
            }

            console.log('Stored env decorations:', g.gameMap.envDecorations)
        }
    }

    genEnvElemObj(key, i){

        //Store ref object in game map
        let envElemRef = clone(rObj(envDecorationsRef[key].sprites))

        //Gen unique id
        envElemRef.elemId = genId(`${envElemRef.id}-`)


        //Style
        let style = ``

        //Absolute placement
        if (envDecorationsRef[key].absoluteCoords != undefined) {
            style += `
                        left: ${envDecorationsRef[key].absoluteCoords[i].x}; 
                        top:  ${envDecorationsRef[key].absoluteCoords[i].y}; 
                    `
        }

        //Spacing
        if (envElemRef.spacing != undefined) {
            style += `margin-left: ${24 * rng(envElemRef.spacing[0], envElemRef.spacing[1])}px;`
        }
        if (envElemRef.spacingY != undefined) {
            style += `padding-bottom: ${24 * rng(envElemRef.spacingY[0], envElemRef.spacingY[1])}px;`
        }

        //Flip elem
        if (envElemRef.flipXPercentChance != undefined) {
            if (rng(100) < envElemRef.flipXPercentChance) {
                style += `transform:scaleX(-1);`
            }
        }

        //Set animation
        if (envElemRef.animationDuration != undefined) {
            style += `animation-duration: ${rng(envElemRef.animationDuration[0], envElemRef.animationDuration[1])}ms;`
        }

        //Save ref obj in game map
        envElemRef.style = style
        envElemRef.spriteType = rng(envElemRef.quantity)
        this.envDecorations[key].sprites[envElemRef.elemId] = envElemRef
        // console.log(this.envDecorations[key])

        return envElemRef
    }

    genEnvElemHtml(envElemRef){
        // console.log(envElemRef)

        //Create HTML sprite
        let envElemHTML

        //Create animation container
        if (envElemRef.animation) {
            envElemHTML = document.createElement('div');
        }

        //Create img html element
        else {
            envElemHTML = document.createElement('img');
            //Img source
            envElemHTML.setAttribute('src', `./03-IMG/bg/id=${envElemRef.id}, variant=${envElemRef.spriteType}.svg`);
        }

        //Id
        envElemHTML.setAttribute('id', envElemRef.elemId)

        //Class
        envElemHTML.classList.add(envElemRef.id)
        //Animation
        if (envElemRef.speed != undefined) {
            envElemHTML.classList.add(`speed-${rng(envElemRef.speed, 1)}`)
        }

        //Style
        envElemHTML.setAttribute('style', envElemRef.style)

        //Onclick event
        if( envElemRef.event != undefined){
            envElemHTML.setAttribute('onclick', genOnClick(envElemRef.event))
            envElemHTML.classList.add('interactive')
        }

        return envElemHTML
    }
}


//TREES
class Tree{
    constructor(treeId, treeRefObj){
        //Pick random tree
        let type = rArr(Object.keys(treesRef))

        if(treeId !== undefined){
            this.id = treeId
        }else{
            this.id = genId('tree-')
        }

        this.spriteType = treesRef[type].spriteType
        this.cost  = treesRef[type].cost
        this.time  = treesRef[type].time
        this.event = treesRef[type].event

        //Manage sprite size
        this.width  = treesRef[type].width * 1
        this.height = treesRef[type].height * 1

        //Position
        this.leftPosition = rng(1800,40)

        //If ref exists => load from reference object
        if(treeRefObj){
            
            //Copy id
            this.id = treeRefObj.id 
            this.spriteType = treeRefObj.spriteType
            this.height = treeRefObj.height * 1

            //Copy position
            this.leftPosition = treeRefObj.leftPosition
        }

        //Add object to map
        g.gameMap.environmentObjects[this.id] = this

        //Gen html
        this.genTreeHtmlElem(this)
    }

    genTreeHtmlElem(refObj){
        let tree = document.createElement('div')

        tree.setAttribute('id', refObj.id)
        tree.classList.add('interactive', 'tree-container')

        tree.setAttribute('style', `
                left: ${refObj.leftPosition}px;
                height: ${refObj.height/2}px;
            `)
            
        tree.setAttribute('onclick', genOnClick(refObj.event))

        //Tree image
        tree.innerHTML = `<img 
                class="tree-sprite" 
                src="./03-IMG/bg/id=${refObj.spriteType}, variant=1.png" 
                style="
                    height: ${refObj.height}px; 
                "
            >`

        el('map').appendChild(tree)
    }

    destroy() {
        // Remove HTML element
        el(this.id).remove()
        
        // Remove self from parent object
        delete g.gameMap.environmentObjects[this.id]
        
        g.saveGame()
    }
}


//BUILDINGS
class Building{
    constructor(type, buildingRefObj){
        this.id = genId('building-')
        this.buildingType = type

        this.cost = {}
        this.cost.stone = buildingsRef[type].costStone * 1
        this.cost.wood = buildingsRef[type].costWood * 1
        this.cost.coins = buildingsRef[type].costCoins * 1

        this.time = buildingsRef[type].time
        this.event = buildingsRef[type].event
        this.flipX = false

        //Manage capacity and production
        this.resources = 0                                       //Amount of resources produced
        this.capacity = buildingsRef[type].capacity         || 0 //Max amount of resources produced
        this.production = buildingsRef[type].productionTime || 0 //Amount of resources produced per time interval

        //Manage sprite size
        this.width = buildingsRef[type].width * 1
        this.height = buildingsRef[type].height * 1

        this.onclick = genOnClick(buildingsRef[type].event)

        //If ref exists => load from reference object
        if(buildingRefObj){
            if(buildingRefObj.id !== undefined){
                this.id = buildingRefObj.id 
            }
            this.resources = buildingRefObj.resources || 0
            this.flipX = buildingRefObj.flipX

            //Placement on the map for predefined buildings
            this.x = buildingRefObj.x
            this.y = buildingRefObj.y

            //If loaded, place html
            genBuildingHtmlElem(this, "load")
        }

        //Store id for allocation
        g.gameMap.focusedBuilding = this.id

        //Hide builder modal
        el('builders').classList.add('hide')

    }

    checkResources(){
        console.log(this.resources)
    }

    destroy() {

        // Remove HTML element
        console.log('Building removed:', el(this.id));
        el(this.id).remove()
        
        // Remove self from parent object
        // delete findObj(g.gameMap.buildings, 'id', this.id)
        delete g.gameMap.buildings[this.id]
        
        g.saveGame()

    }
}

//Not methods because on load building class is not initiated
//Generate HTML elem for building
function genBuildingHtmlElem(buildingObject, mode){

    let building = document.createElement('div')

    building.setAttribute('id', buildingObject.id)
    building.setAttribute('class', `building projection`)
    building.setAttribute('type', buildingObject.buildingType)

    //Check it was flip
    if(buildingObject.flipX){
        building.classList.add('flipX')
    }

    //Building image
    building.innerHTML = genBuildingSprite(buildingObject)    

    el('map').appendChild(building)

    //Add coordinates if building was loaded and has xy
    if(mode === 'load'){
        // console.log("LOAD-OBJ:", buildingObject)

        building.setAttribute('style', `
            left: ${(buildingObject.x - 2) * g.gameMap.cellSize}px;
            bottom: 50%;    
            
            width:${buildingObject.width}px; 
            height:${buildingObject.height}px;
        `)

        //Add onclick event if modal is defined
        setOnClickEvent(buildingObject, building)

        //Remove projection if you are loading a building
        building.classList.remove('projection')
    }

    //Trigger build mode
    else{
        g.gameMap.buildMode = true
        g.gameMap.focusedBuildingHtmlElem = building

        //Add mouse move event listener
        g.gameMap.mapElem.addEventListener('mousemove', moveBuilding);

        //Add click exit event
        g.gameMap.mapElem.addEventListener('click', placeBuilding);
        // el('body').addEventListener('click', placeBuilding);
    }
}

function genBuildingSprite (buildingRefObj){
    let innerHTML = `
        <div 
            class="sprite-container" 
            style="height: ${parseInt(buildingRefObj.height) +2}px; 
            width:${parseInt(buildingRefObj.width) +2}px;"
        >
            <img 
                class="sprite" 
                src="./03-IMG/structure/id=${buildingRefObj.buildingType}, variant=1.png" 
                style="height: ${parseInt(buildingRefObj.height) +2}px;"
            >
        </div>
    `

    return innerHTML
}


//Handles hover building projection while placing
function moveBuilding(){
    //Set coordinates
    let x = relativeCoords(event).x + 1
    let y = relativeCoords(event).y + 1

    //UNDEFINED
    g.gameMap.focusedBuildingObj = g.gameMap.buildings[g.gameMap.focusedBuilding]
    // console.log('FOCUS:', g.gameMap.focusedBuildingObj)
    // g.gameMap.focusedBuildingObj = findByProperty(g.gameMap.buildings, 'id', g.gameMap.focusedBuilding)

    //Prevent placing building beyond the map border
    if(x < 0){x = 0}
    if(x > g.gameMap.gridWidth){x = g.gameMap.gridWidth}

    //Update CSS
    el(g.gameMap.focusedBuilding).setAttribute('style', `
        left: ${(x - 2) * g.gameMap.cellSize}px;
        bottom: 50%;
        
        width:${buildingsRef[el(g.gameMap.focusedBuilding).getAttribute('type')].width}px; 
        height:${buildingsRef[el(g.gameMap.focusedBuilding).getAttribute('type')].height}px;
    `)

    //Update object coords
    g.gameMap.focusedBuildingObj.x = x
    g.gameMap.focusedBuildingObj.y = 8

    // console.log(x, y)
}

//Clears event listeners when projection is placed on map
function placeBuilding(){

    //Exit build mode, building movement is done via moveBuilding event listener
    g.gameMap.buildMode = false

    //Clear event listeners for movement and placement
    g.gameMap.mapElem.removeEventListener('mousemove', moveBuilding);
    g.gameMap.mapElem.removeEventListener('click', placeBuilding);
    // el('body').removeEventListener('click', placeBuilding);

    let focusedBuildingObj = g.gameMap.buildings[g.gameMap.focusedBuilding]
    // let focusedBuildingObj = findByProperty(g.gameMap.buildings, 'id', g.gameMap.focusedBuilding)
    // console.log(focusedBuildingObj.x, focusedBuildingObj.y)

    //Add after placing > avoid triggering the modal on placing
    setOnClickEvent(g.gameMap.focusedBuildingObj, g.gameMap.focusedBuildingHtmlElem)

    g.gameMap.focusedBuildingHtmlElem.classList.remove('projection')

    //Update cost if it was a mine
    if(focusedBuildingObj.buildingType === 'mine'){
        generateUI()
    }

    // console.log(focusedBuildingObj)
    g.saveGame()
}

//Relative coords for map, helps to keep buildings aligned with css grid tiles
function relativeCoords(event , mode) {
    var bounds = g.gameMap.mapElem.getBoundingClientRect();
    var x = event.clientX - bounds.left;
    var y = event.clientY - bounds.top;

    if (mode == 'coords') {
        return {x: x, y: y};
    }else{
        return {x: Math.floor(x / g.gameMap.cellSize), y: Math.floor(y / g.gameMap.cellSize)};
    }
}


//Sets onclick to html element
function setOnClickEvent(buildingObject, building){
    if(buildingObject.onclick !== undefined){
        building.classList.add('interactive')

        // Also opens collection for labs
        if( buildingObject.buildingType.includes('lab') || buildingObject.buildingType.includes('research') ){
            building.setAttribute('onclick', `toggleModal('collectionModal'), ${buildingObject.onclick}`)
        }
        else{
            building.setAttribute('onclick', buildingObject.onclick)
        }
    }
}

//Creates on click string
function genOnClick(event){
    let onclick

    if(event){
        if(event.includes('modal')){
            onclick = `toggleModal('${event.split('-')[1]}')`
        }
        else if(event.includes('click')){
            onclick = `clickEvent("${event.split('-')[1]}", this)`
        }
    }

    return onclick
}
//Get stone
function clickEvent(mode, htmlElem){
    if(mode === 'stone'){
        let mineObj = g.gameMap.buildings[htmlElem.id]

        //Record event time
        if(mineObj.eventTime === undefined){
            g.gameMap.buildings[htmlElem.id].eventTime = Date.now() - config.stoneSpawnInterval
        }

        if(Date.now() - mineObj.eventTime >= config.stoneSpawnInterval){
            g.gameMap.buildings[htmlElem.id].eventTime = Date.now()
            showAlert('+3 stone')
            g.plObj.changeResource('stone', 3)

            let mineSprite = el(mineObj.id).childNodes[1].childNodes[1]
            mineSprite.classList.add('emptyMine')
        }
        else{
            let remainingTime = Math.round((config.stoneSpawnInterval - (Date.now() - mineObj.eventTime))/1000)

            showAlert(`No stone mined. ${remainingTime} seconds left.`)
        }
    }

    if(mode === 'wood'){
        showAlert('+3 wood')
        g.plObj.changeResource('wood', 3)

        //Remove tree after clicking        
        g.gameMap.environmentObjects[htmlElem.id].destroy()
    }

    g.saveGame()
}


//Demolisher
function removeBuilding(){

    //Update all building sprites
    el('.building', 'all').forEach(building => {
        building.classList.add('projection')
        building.setAttribute('onclick', 'destroyBuilding(this.id)')
    })

    //Hide demo modal when you enter the mode
    el('demolisher').classList.add('hide')

    console.log('Before:', g.gameMap.buildings);

    //Show exit button
    el('exit-demolisher').classList.remove('hide')
    el('nav').classList.add('hide')
}

function destroyBuilding(buildingId){

    //Clear building states
    el('.building', 'all').forEach(building => {
        building.classList.remove('projection')
        building.setAttribute('onclick', genOnClick(g.gameMap.buildings[building.id].event))
    })

      //Hide exit button
      el('exit-demolisher').classList.add('hide')
      el('nav').classList.remove('hide')

    //Exit mode
    if(buildingId === 'exit') return

    //Trigger destroy method, clears html and obj
    g.gameMap.buildings[buildingId].destroy()
    
    //Save game
    g.saveGame()
}