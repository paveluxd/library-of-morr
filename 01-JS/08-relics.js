//RELIC
    class Card {
        //constructor(cardRef, location, mode)
        constructor(args){
            let newCardName = args.name

            //Recreates existing card
            if(args.mode === 'regen'){            

                this.cardRefObj = findByProperty(cardsRef, 'name', args.cardObj.name)            


                this.cardId = args.cardObj.cardId
                this.rarity = args.cardObj.rarity
                this.location = args.cardObj.location  
            }

            //Creates new random card
            else{
                //Choose random card if no name provided
                if(args.name == undefined){
                    if(args.setName == undefined){
                        args.name = rArr(cardsRef).name
                    }
                    else {
                       let set = cardsRef.filter((card) => card.set === args.setName);
                    //    console.log(cardsRef, args.setName);
                        newCardName = rArr(set).name                       
                    }
                }

                //Find card reference in ref object
                this.cardRefObj = findByProperty(cardsRef, 'name', newCardName)            
                // console.log(this.cardRefObj);
                
                //Set props
                this.cardId = genId('cr')
                this.location = args.location //stores id of location elem
    
                //Pick card rarity
                let roll = rng(1000)
                if      (roll > 995){this.rarity = 'set'}
                else if (roll > 980){this.rarity = 'legendary'}
                else if (roll > 900){this.rarity = 'epic'}
                else if (roll > 700){this.rarity = 'rare'}
                else                {this.rarity = 'common'}
            }

            this.name = this.cardRefObj.name
            this.description_1 = this.cardRefObj.description_1
            this.description_2 = this.cardRefObj.description_2
            this.tags = this.cardRefObj.tags
            this.source = this.cardRefObj.source  
            this.gridOrder = this.cardRefObj.gridOrder
            this.set = this.cardRefObj.set
                     
            //Add card to game obj
            g.cards.push(this)        
            
            //Generate html elem
            let card = this.genHtml()
            
            //Append html element to location  
            
            if(el(this.location) !== null){
                if(this.location === 'collection'){
                    
                    //Only adds cards of active page
                    console.log(this.set, g.collection.page);
                    if(this.set.includes(g.collection.page)){
                        el('collection').append(card)
                    }
                }
                else{
                    this.moveCard(card, this.location)
                }
            }    
            

            //Check if quest has to be regenerated
            if(g.cards.length === config.cardsToStartQuest){
                g.research = new Research
            }
        }

        //Returns card html element
        //Used for LS regen
        genHtml(){
            let card = document.createElement('div')
            // let cardImg = this.name used to assign image linked with name
            
            card.id = this.cardId
            card.classList = 'card dark-text'
            card.setAttribute('draggable','true')
            card.setAttribute('ondragstart','drag(event)')

            card.setAttribute('style', 
                `
                    grid-area: a${this.gridOrder}
                `
            )
            
            // console.log(this.cardRefObj);          
            let imgSrc = "./03-IMG/relics/id=placeholder.png"
            if(this.cardRefObj.img === "y"){
                imgSrc = `./03-IMG/relics/id=${this.name}.png`
            }

            card.innerHTML = `
                    <div class="card-data">
                        <img class="card-icon" draggable="false" src="${imgSrc}"/>
                        <img class="" draggable="false" src="./03-IMG/misc/card-div.svg"/>
                        <p>${upp(this.name)}</p>
                    </div>
            `

            // <img class="card-rarity-icon" draggable="false" src="./03-IMG/rarity/id=${this.rarity}.png"/>

            //On right click event
            card.addEventListener("contextmenu", (event) => {
                if(config.rClickEvent == true){
                    if(this.location === "hand" || this.location.includes('page')){
                        this.location = "contract-content_slot-0"
                    } else {
                        this.location = "hand"
                    }
                    event.preventDefault();
                    this.moveCard(card, this.location)
                    g.saveGame()
                }
            });

            return card
        }

        moveCard(cardHtmlElem, locationId){

            this.location = locationId

            //If you add to hand, add to the start of the row
            if(locationId === 'hand'){
                el(locationId).insertBefore(cardHtmlElem, el(locationId).firstChild)
            }

            //Else add to slot
            else{                
                el(locationId).append(cardHtmlElem)
            }     

            //Calculate reward
            // g.calculateReward()
        }
    }


//COLLECTION
    class Collection{

        constructor(){

            //Collection pages
            this.pageIdArr = Object.keys(labRef)
            this.page = this.pageIdArr[0] //Update id to default page

            //Add tab per page
            this.pageIdArr.forEach(pageId => {
                let tab = document.createElement('button')
                tab.id = `${pageId}_tab`
                tab.setAttribute('onclick', `g.collection.loadPage('${pageId}')`)
                tab.innerHTML = `<h3>${labRef[pageId].tabName}</h3>`
                
                //Set 1st tab as active
                tab.classList = 'tab collection-tab'
                el('collection-tabs').appendChild(tab)
            })

            //Collection grid size
            el('collection').setAttribute('style',`
                width:   calc(var(--card-width) * ${config.albumColumns} + 2px + 16px);
                height: calc(var(--card-height) * ${config.albumRows}    + 2px + 16px);

                grid-template-columns: repeat(${config.albumColumns} , 1fr);
                grid-template-rows:    repeat(${config.albumRows}    , 1fr);

                grid-template-areas:
                    "a1 a2" 
                    "a3 a4" 
                    "a5 a6"
                    "a7 a8"
                    "a9 a10"
                ;
            `)

            this.setActiveTab()
        }

        loadPage(pageId){
            
            //Next previous buttons
            if(pageId == 'previous'){
                let index = this.pageIdArr.indexOf(this.page)
                index--
                pageId = this.pageIdArr[index]

                if(pageId === undefined){
                    pageId = this.pageIdArr[this.pageIdArr.length - 1]
                }
                
            } 
            else if(pageId == 'next'){
                let index = this.pageIdArr.indexOf(this.page)
                index++
                pageId = this.pageIdArr[index]

                if(pageId === undefined){
                    pageId = this.pageIdArr[0]
                }

                // console.log(pageId);
            }

            //Update page
            this.page = pageId

            //Clear album
            el('collection').innerHTML = ``
            console.log(2);
            
            this.regenerateCards()
            this.setActiveTab()
        }

        regenerateCards(){
            console.log(1);
            
            g.cards.forEach(card => {                
                console.log(card.set, this.page);
                if(card.set.includes(this.page)){
                    el('collection').append(card.genHtml())
                }      
            })
        }

        setActiveTab(){

            //Select all tabs
            let tabs = el('.collection-tab', 'all')

            tabs.forEach(tab =>{

                //Remove selection
                tab.classList.remove("active")
                
                //Add .active
                if(tab.id.split('_')[0] === this.page){
                    tab.classList.add("active")
                }
            })
        }
    }


//INSPECTION TABLE
    //Takes N minutes to complete
    class InspectionTable {
        constructor(){
        }
        
        inspect(){
            if(el('table').childNodes.length > 0){            
                // console.log(el('table').childNodes[0]);
                
                //Find card reference by element id
                let cardRef = findByProperty(g.cards, 'location', 'table')
    
                //Override metadata fields
                el('inspector').innerHTML = `
                    <h1 id="name">${upp(cardRef.name)}</h1>          
                        <p id="description">${cardRef.description_1}</p>
                        <div id="year">Year: ${cardRef.year}</div>
                        <div id="tags">Tags: ${cardRef.tags}</div>
                        <div id="rarity">Rarity: <img src="./03-IMG/rarity/${cardRef.rarity}.svg"> ${upp(cardRef.rarity)}</div>
                        <div id="source">Source: <a href="${cardRef.source}" target='_blank'>${cardRef.source}</a> </div>
                    `
    
            }    
        }
    }


// SELL AREA
    class SellArea {
    constructor(){
    }

    sell(containerId){
        if(containerId === undefined){containerId = 'sell-area'}
        let containerElem = el(containerId)

        if(containerElem.childNodes.length > 0){
            // console.log(el('table').childNodes[0]);

            // Count the number of cards in the containerId before deletion
            const numberOfCards = containerElem.childNodes.length;

            // Remove all child nodes within containerId
            while (containerElem.firstChild) {
                containerElem.removeChild(containerElem.firstChild);
            }

            // Find and remove all card references from g.cards connected to containerId
            g.cards = g.cards.filter(card => card.location !== containerId);

            //Give player 10c
            g.plObj.changeResource('coins', numberOfCards * 10
            )

            g.saveGame()
            updateUI()
        }
    }
}



    

//CONTRACT RESEARCH
    //If > 4 cards in album, generate a contract with card description, player has to pick the right card to win.
    class Research{
        constructor(loadedCard){
            this.width = 1
            this.height = 1
            this.researchCardPool = []
            // this.researchId = genId('re')
            // this.raritySequence = []
            el('contract-content').innerHTML = ''


            //Generate "get N cards" contract if not enough cards
            if(g.cards.length < config.cardsToStartQuest){
                el('contract-description').innerHTML = `Get ${config.cardsToStartQuest} relics from Archeologist to unlock research.`
                el('contract-controls').classList.add('hide')
            }
    
            //Generate "Find correct card" contract
            else{
                this.pickRandomQuestion(loadedCard)


                //Generate new slots
                let slotQuantity = this.width * this.height;
                g.genCardSlot('contract-content', slotQuantity)


                //Set descriotion
                el('contract-description').innerHTML = this.contractCard[`description_${rng(2)}`]


                //Make button visible if reset from get N cards
                el('contract-controls').classList.remove('hide')
            }
        }


        //Pick random research
        pickRandomQuestion(loadedCard){
            //Define research pool based on level.
            clearArr(this.researchCardPool) //properly remove items from array

            //Check for loaded card
            if(loadedCard !== undefined){
                //If contract exists, load contract card
                this.contractCard = loadedCard
            }

            //If no loaded cards, generate
            else {
                //Add cards that player owns
                g.cards.forEach(card => {
                    this.researchCardPool.push(findByProperty(g.cardsRef, "name", card.name))
                })
                // researchCardPool.push(...g.cards)

                //Add cards from each pack if level requirement is met
                packsRef.forEach(pack => {
                    if(pack.lvlUnlockResearch <= g.plObj.lvl){
                        g.cardsRef.forEach(card => {
                            if(card.set === pack.name){
                                this.researchCardPool.push(card)
                            }
                        })
                    }
                })

                //Remove duplicates
                this.researchCardPool = removeDuplicatesArr(this.researchCardPool)
                // console.table(this.researchCardPool)

                //Pick random card
                let cardNotSelected = true

                //Roll for frequency
                while(cardNotSelected){

                    //Pick random card from pool
                    this.contractCard = rArr(this.researchCardPool)
                    // console.log(`Rolling new card:`)
                    // console.log(this.contractCard)
                    // console.log(typeof this.contractCard.frequencyRange === "number" && !isNaN(this.contractCard.frequencyRange))

                    //Check its frequency value
                    if(typeof this.contractCard.frequencyRange === "number" && !isNaN(this.contractCard.frequencyRange)){

                            //Roll
                            let roll = rng(0, this.researchCardPool.length)
                            // console.log(`Roll:${roll}\nFrequency range: ${this.contractCard.frequencyRange}\nPool: ${config.cardsInPack * g.plObj.lvl}`)

                            //If roll less that freq, reroll
                            if(roll > this.contractCard.frequencyRange){

                                // console.log("Card selected")

                                cardNotSelected = false
                                return
                            }

                            // console.log("Card not selected. Rerolling.")
                    }

                    //Select card if no frequency
                    else{
                        // console.log("No frequency range value. Card selected.")
                        cardNotSelected = false
                    }
                }
            }
        }


        //Q frequency management
        setFrequencyScore(sourceCard){
            // console.log(sourceCard)

            //Find card in reference
            let referenceCard = findByProperty(g.cardsRef, 'name', sourceCard.name)
            // console.log(referenceCard)

            //Set new frequency
            referenceCard.frequencyRange = this.researchCardPool.length + 1 //+1 due to order of operations
        }

        //Reduces freq scores of each card per research
        reduceFrequencyScores(){
            g.cardsRef.forEach(card => {
                card.frequencyRange--

                if(card.frequencyRange < 1){
                    card.frequencyRange = undefined
                }
            })
        }

        sellResearch(){

            //Check placed cards 
            let addedCards = findByProperty(g.cards, 'location', 'contract-content_slot-0', 'includes')
            // console.log(addedCards);
            // console.log(findByProperty(addedCards, 'name', this.contractCard.name));


            //Check if multiple cards in slot have the same name
            let cardsAreTheSame = true

            addedCards.forEach(card =>{
                if(card.name != addedCards[0].name){
                    cardsAreTheSame = false
                }
            })


            //Win
            if(
                addedCards != undefined //Cards are added
                && findByProperty(addedCards, 'name', this.contractCard.name) != undefined //Check if contract question matches the added card
                && cardsAreTheSame //Check if all items are the same
            ){
                let coinsReward = 0
                let expReward = config.expPerResearch

                //Modify reward based on card rarity
                addedCards.forEach(card => {
                    if(card.rarity === 'rare'){
                        coinsReward += 5
                    }
                    else if (card.rarity === 'epic'){
                        expReward += 1
                    }
                    else if (card.rarity === 'legendary'){
                        coinsReward += 10 * addedCards.length
                    }
                    else if (card.rarity === 'set'){
                        expReward += 1 * addedCards.length
                    }
                })
                
                //Modify reward based on card quantity
                for(var i = 0; i < addedCards.length; i++){
                    coinsReward += Math.round(config.researchReward * (1 + i / 5))
                    // console.log(coinsReward);
                }



                //Reduce card frequency score
                this.setFrequencyScore(this.contractCard)



                //Misc
                g.plObj.changeResource('coins', coinsReward)
                g.plObj.gainExp(expReward)
                showAlert(`Correct!<br> You win ${coinsReward} coins, and gain ${expReward} exp.`)
            } 


            //Lose
            else{
                showAlert(`Incorrect!<br> You lost ${config.researchReward} coins.`)
                g.plObj.changeResource('coins', -config.researchReward)
            }


            //Remove cards from g.cards after completing the research
            addedCards.forEach(card => {
                removeFromArr(g.cards, card)
            })


            //Reduce frequency of all cards by 1
            this.reduceFrequencyScores()

            //Generate new research
            g.research = new Research()
        }
    }