import { ObjectId } from 'mongodb';

import { type Event, type EventsScenarios } from './types';
import refs from './references';

export class Generator {
  date: { current: Date; end: Date };

  constructor(date: { start: Date; end: Date }) {
    this.date = { current: date.start, end: date.end };
  }

  getEventsScenarios(worker: number): EventsScenarios | undefined {
    const events = Array.from({ length: refs.general.batchSize }).map(() => this.getEvent());

    if (events[0].date > this.date.end) return undefined;

    return { _id: new ObjectId(), date: events[0].date, events, worker };
  }

  getEvent(): Event {
    const value = Math.random();
    const event: Event = { date: this.getDate(), key: this.getKey() };

    if (value < 0.8) event.approved = 1;
    else if (value < 0.9) event.noFunds = 1;
    else if (value < 0.975) event.pending = 1;
    else event.rejected = 1;

    return event;
  }

  private getDate(): Date {
    this.date.current = new Date(this.date.current.getTime() + refs.general.eventDeltaTime);

    return new Date(this.date.current.toISOString().split('T')[0]);
  }

  private getKey(): string {
    const keyNumber = Math.random() < 0.6 ? Math.random() : this.gaussianRandom();
    const keyHex = Math.ceil(refs.general.users * keyNumber).toString(16);

    return keyHex.toUpperCase().padStart(64, '0');
  }

  private gaussianRandom(): number {
    const [mean, stdev] = [0, 0.015];
    const [u, v] = [1 - Math.random(), Math.random()];
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    return Math.abs(z * stdev + mean);
  }

  getReportKey(): string {
    const keyHex = Math.ceil(refs.general.users * Math.random()).toString(16);

    return keyHex.toUpperCase().padStart(64, '0');
  }
}
