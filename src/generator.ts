import { type Event } from './types';
import refs from './references';

export class Generator {
  date: { current: Date; end: Date };

  constructor(date: { start: Date; end: Date }) {
    this.date = { current: date.start, end: date.end };
  }

  getEventsScenarios(): Event[] | undefined {
    const events = Array.from({ length: refs.general.batchSize }).map(() => this.getEvent());

    if (events[0].date > this.date.end) return undefined;

    return events;
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

  private getKey(): number {
    const keyNumber = Math.random() < 0.6 ? Math.random() : this.gaussianRandom();

    return Math.ceil(refs.general.users * keyNumber);
  }

  private gaussianRandom(): number {
    const [mean, stdev] = [0, 0.015];
    const [u, v] = [1 - Math.random(), Math.random()];
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    return Math.abs(z * stdev + mean);
  }

  getReportValues(): { date: Date; key: number } {
    const delta = Math.random() * (this.date.end.getTime() - this.date.current.getTime());

    return {
      date: new Date(this.date.current.getTime() + delta),
      key: Math.ceil(refs.general.users * Math.random()),
    };
  }
}
