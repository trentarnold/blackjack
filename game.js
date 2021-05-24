// Constructor to make the deck
// i got the idea for makeing a class for the deck and cards from https://www.youtube.com/watch?v=NxRwIZWjLtE
// although i applied it differently.
class Deck {
    constructor(cards = makeDeck()){
        this.cards = cards;
    }
    get deckLength(){
        return this.cards.length
    }
}
//constructor to make the individual cards
class Cards {
    constructor(suit, value, trueValue, color){
        this.suit = suit;
        this.value = value;
        this.trueValue = trueValue;
        this.color = color;
    }

}
//a class to hold all game functions
class Game  {
    //set deck to a new deck
    constructor(deck = new Deck()){
        this.deck = deck;
        this.shuffle();
        this.playerHand =[];
        this.dealerHand =[];
        this.playerValueTotaled =0;
        this.dealerValueTotaled =0;
        this.playerStayed = false;
        this.winner = undefined;
    }
    //reset all variable and html and create a new deck
    restartGame(){
        this.deck = new Deck();
        this.shuffle();
        this.playerHand =[];
        this.dealerHand =[];
        this.playerValueTotaled =0;
        this.dealerValueTotaled =0;
        this.playerStayed = false;
        this.winner = undefined;
        $('.end-game-module-container').removeClass('show');
        $('.dealer-hand').html('')
        $('.player-hand').html('')
        this.dealCards();

    }
    //deal two cards to each player
    dealCards(){
        for(let i = 0; i < 4; i++){
            //set next card to the last card in cards array
            let nextCard = this.deck.cards.pop();
            //append next card to player hand, update hand and player array
            if(i % 2 === 0){
                this.playerValueTotaled += nextCard.trueValue;
                $('.player-hand').append(this.setCardHtml(nextCard))
                this.playerHand.push(nextCard)    
            //append next card to dealer hand, update hand and dealer array
            }else {
                //make the first card dealt to dealer have the hidden class added to it
                if(i === 1){
                    this.dealerTotalWithHiddenCard += nextCard.trueValue;
                    $('.dealer-hand').append(this.setCardHtml(nextCard, true))
                }else{
                    this.dealerTotalWithHiddenCard += nextCard.trueValue;
                    $('.dealer-hand').append(this.setCardHtml(nextCard))
                }
                this.dealerValueTotaled += nextCard.trueValue;
                this.dealerHand.push(nextCard)
            }
        }
        this.checkAceValue(this.dealerHand, 'Dealer');
        this.checkAceValue(this.playerHand, 'Player');
        this.updateTotals();
        if(this.checkBlackJack()){
            this.declareWinner()
        }
    } 
    //set the html for the cards themselves, to be appended to hands later. if hidden is true, card is 'flipped'
    setCardHtml(nextCard, hidden =false){
        if(hidden){
           return $(`<div class='card hidden' data-value='${nextCard.value} ${nextCard.suit}' style='color:${nextCard.color}'>${nextCard.suit}</div>`)
        }
        return $(`<div class='card' data-value='${nextCard.value} ${nextCard.suit}' style='color:${nextCard.color}'>${nextCard.suit}</div>`)
    }
    checkBlackJack(){
        //returns if no value is 21, is called after cards are dealt
        if(this.playerValueTotaled !== 21 && this.dealerValueTotaled !== 21) return
        //check to see if any hand is equal to 21, return winner draw or false, remove hidden class from player card
        if(this.playerValueTotaled === 21 && this.dealerValueTotaled === 21){
            this.winner = `Draw, both players have blackjack`
            return 'Draw'
        }if(this.playerValueTotaled === 21){
            this.winner = `Player wins with a blackjack`
           return 'Player'
        }if(this.dealerValueTotaled === 21){
            this.winner = `Dealer wins with a blackjack`
            return 'Dealer'
        }
        return false

    }
    //control what happens when player hits
    playerHit(){
        //check to make sure player hasnt hit stay
        if(this.playerStayed) return
        let nextCard = this.deck.cards.pop();
        this.playerValueTotaled += nextCard.trueValue;
        $('.player-hand').append(this.setCardHtml(nextCard));
        this.playerHand.push(nextCard);
        this.checkAceValue(this.playerHand, 'Player');
        if(this.checkBust(this.playerValueTotaled, 'Player')){
            this.declareWinner();
            //update totals with false as argument means both dealer cards get added to the total
            this.updateTotals(false);
        }else{
            this.updateTotals();
        }

    }
    playerStay(){
        //stops them from hitting again
        this.playerStayed = true;
        //reveals true dealer total and shows hidden card
        this.updateTotals(false);
        $('.card').removeClass('hidden');
        //set half second timeout before starting dealer play, makes it a little easier to follow
        setTimeout(()=>{
            this.dealerPlay();
        }, 500)

    }
    // called when player hits stay. returns if dealer makes a hand or busts. calls itself if not
    dealerPlay(){
        if(!this.includesAcesAtEleven(this.dealerHand) && this.dealerValueTotaled >=17){
            this.checkWinner();
            return
        }
        if(this.dealerValueTotaled >= 18 && this.dealerValueTotaled <=21){
            this.checkWinner();
            return
        }
        let nextCard = this.deck.cards.pop();
        this.dealerHand.push(nextCard);
        this.dealerValueTotaled += nextCard.trueValue;
        $('.dealer-hand').append(this.setCardHtml(nextCard));
        this.checkAceValue(this.dealerHand, 'Dealer');
        if(this.checkBust(this.dealerValueTotaled, 'Dealer')){
            this.declareWinner();
        };
        this.updateTotals(false);
        if(this.dealerValueTotaled > 21){
            return
        }
        setTimeout(()=>{
            this.dealerPlay();
        }, 500)
      
    }
    //returns true if any aces are still valued at 11
    includesAcesAtEleven(array){
        return array.some(card => card.trueValue === 11);
    }
    //shuffle the cards by looping through deck and swapping the current card with a card at a random index
    shuffle(){
      for(let i =0; i < this.deck.cards.length; i++){
        let randomIndex = Math.floor(Math.random() * 52);
        let currentCard = this.deck.cards[i];
        let randomCard = this.deck.cards[randomIndex];
        this.deck.cards[i] = randomCard;
        this.deck.cards[randomIndex] = currentCard
      }
    }
    //check true value of aces, if total of hand is less than 22 change the true value to 1
    checkAceValue(array, playerInString){
        //run a check on which player is going, and if there totalValue >= 22
        if((playerInString === 'Player' && this.playerValueTotaled <22) ||
         (playerInString === 'Dealer' && this.dealerValueTotaled < 22)) return
         //loop through array to see if they have any aces where the true value still === 11
        for(let i = 0; i < array.length; i++){
            if(array[i].trueValue === 11){
                array[i].trueValue = 1;
                if(playerInString === 'Player'){
                    this.playerValueTotaled -=10;
                }else{
                    this.dealerValueTotaled -=10;
                }
                break
            }
        }

    }
    //check if either player or dealer have over 21, if they do set winner to the other
    checkBust(totalValueOfHand, player){
        //return if less than 21
        if(totalValueOfHand <= 21) return
        const otherPlayer = player === 'Dealer' ? 'Player' : 'Dealer'
        this.winner = `${otherPlayer} wins! ${player} busted`
        return this.winner;
    
    }
    //check to see who has the higher hand, will only be called when dealer makes his hand
    checkWinner(){
        if(this.dealerValueTotaled === this.playerValueTotaled){
            this.winner = `Draw`
            this.declareWinner();
        }else{
            this.winner = this.dealerValueTotaled > this.playerValueTotaled ? `Dealer Wins` : 'Player Wins!'
            this.declareWinner()
        }
    }
//declare who the winner is, flip dealer card and update total, pull up winning module
    declareWinner(){
        $('.dealer-total').text(`Dealer total: ${this.dealerValueTotaled}`)
        $('.card').removeClass('hidden');
        //set timeout so player has time to see cards
        setTimeout(()=>{
            $('.end-game-module-container').addClass(`show`)
            $('.winner').text(`${this.winner}`)
            $('.dealer-win-text').text(`Dealer Hand: ${this.dealerValueTotaled}`)
            $('.player-win-text').text(`Player Hand: ${this.playerValueTotaled}`)
        }, 1000)
      
    }
    //update the totals display, firstCard hidden set to false when player hits stay
    updateTotals(firstCardHidden = true){
        $('.player-total').text(`Player total: ${this.playerValueTotaled}`);
        if(firstCardHidden){
            $('.dealer-total').text(`Dealer showing: ${this.dealerHand[1].trueValue}`);
        }else{
            $('.dealer-total').text(`Dealer total: ${this.dealerValueTotaled}`);
        }
        
    }

}
const colors = ['red', 'red', 'black', 'black']
const suits = ['♥', '♦', '♠', '♣'];
const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const trueValues = [2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 , 10 , 10 , 10 , 11];

//this return an array of 52 cards with suits values and true values, used in deck class
function makeDeck(){
return suits.flatMap((suit, indexOfSuit) =>{
     return values.map((value, index) =>{
         return new Cards(suit, value, trueValues[index], colors[indexOfSuit])
     })
})
}
let game = new Game();
game.dealCards();
// add event listeners for the hit stay and reset buttons
$('.hit-button').click(()=>{
    game.playerHit()
})
$('.stay-button').click(()=>{
    game.playerStay()
})
$('.restart').click(()=>{
    game.restartGame();
})

