import { TicketsRepository } from "../data/tickets.repository";
import { EventRecord, Seat } from "../data/types";
import { VenuesRepository } from "../data/venues.repository";
import { SeatInventory } from "../inventory/seat-inventory";
import { round2 } from "../shared/money";
import { PriceContext, PricingRule } from "./pricing-rule";

export class StandardPricing implements PricingRule {
    unitPrice({ event, seat }: PriceContext): number {
        return event.sectorPrices[seat.sector];
    }
}

export class FlatPricing implements PricingRule {
    unitPrice({ event }: PriceContext): number {
        return event.flatPrice!;
    }
}

export class FreePricing implements PricingRule {
    unitPrice(): number {
        return 0;
    }
}

export class EarlyBirdPricing implements PricingRule {
    constructor(private readonly tickets: TicketsRepository) {}

    unitPrice({ event, seat, position }: PriceContext): number {
        const price = event.sectorPrices[seat.sector];
        
        const { tickets, discount } = event.earlyBird!;

        // controllo se il venduto è più di 500, applico prezzo intero o scontato
        const ticketNumber = this.tickets.countByEvent(event.id) + position;
        return ticketNumber <= tickets ? round2(price * (1 - discount)) : price;
    }
}

export class DynamicPricing implements PricingRule {
    constructor(private readonly venues: VenuesRepository){}
    
    unitPrice({ event, seat }: PriceContext): number {
        const price = event.sectorPrices[seat.sector];
        const { total, free } = this.sectorAvailable(event, seat);

        if(free > total /2) return price;
        if(free >= total / 5) return price*1.15;
        return price*1.3;
    }

    private sectorAvailable(event: EventRecord, seat: Seat) {
        const invetory = SeatInventory.getInstance();
        const venue = this.venues.findById(event.venueId);

        const seats: Seat[] = venue!.seats.filter(s => s.sector === seat.sector)
        
        let total = 0
        let free = 0
        for (const s of seats){
            if(s.kind === 'standing'){
                total += s.capacity!;
                total += s.capacity! - invetory.standingSold(event.id, s.id);
            }
            else {
                total += 1;
                if(!invetory.isSold(event.id, seat.id))
                {
                    //boh mi son perso
                }
            }
        }
        return { total, free }
    }
}