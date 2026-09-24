/**
 * Conversation Mission — guided mini-scene (stub).
 * Not full dialogue AI: 5–8 scripted beats, pick best German reply from 3 choices.
 */

export interface ConversationChoice {
  id: string;
  /** German reply shown on the button (content, not i18n) */
  german: string;
}

export interface ConversationBeat {
  id: string;
  /** i18n key for the short context / NPC line */
  contextKey: string;
  /** Scene image: emoji or /public url */
  image: string;
  imageKind: 'emoji' | 'url';
  /** Optional LO id for light mastery recording */
  loId?: string;
  /** Topic for mastery when loId is set */
  topicId?: string;
  choices: ConversationChoice[];
  correctId: string;
}

export interface ConversationMission {
  id: string;
  /** i18n key for mission title */
  titleKey: string;
  beats: ConversationBeat[];
}

/** Hardcoded café / greeting mission — Arabic-friendly UI via i18n; German replies as content */
export const CAFE_GREETING_MISSION: ConversationMission = {
  id: 'cafe-greeting',
  titleKey: 'cm.mission.cafe',
  beats: [
    {
      id: 'enter',
      contextKey: 'cm.cafe.enter',
      image: '☕',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Guten Tag!' },
        { id: 'b', german: 'Gute Nacht!' },
        { id: 'c', german: 'Auf Wiedersehen!' },
      ],
      correctId: 'a',
    },
    {
      id: 'seat',
      contextKey: 'cm.cafe.seat',
      image: '🪑',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Nein, danke.' },
        { id: 'b', german: 'Ja, bitte. Einen Tisch für eine Person.' },
        { id: 'c', german: 'Ich bin ein Hund.' },
      ],
      correctId: 'b',
    },
    {
      id: 'order-drink',
      contextKey: 'cm.cafe.orderDrink',
      image: '/content/essen/wasser.png',
      imageKind: 'url',
      loId: 'wasser',
      topicId: 'essen',
      choices: [
        { id: 'a', german: 'Einen Kaffee, bitte.' },
        { id: 'b', german: 'Ich schlafe jetzt.' },
        { id: 'c', german: 'Wo ist der Bahnhof?' },
      ],
      correctId: 'a',
    },
    {
      id: 'order-food',
      contextKey: 'cm.cafe.orderFood',
      image: '/content/essen/kuchen.png',
      imageKind: 'url',
      loId: 'kuchen',
      topicId: 'essen',
      choices: [
        { id: 'a', german: 'Das ist mein Auto.' },
        { id: 'b', german: 'Und ein Stück Kuchen, bitte.' },
        { id: 'c', german: 'Ich habe Hunger… nach Schuhen.' },
      ],
      correctId: 'b',
    },
    {
      id: 'thanks',
      contextKey: 'cm.cafe.thanks',
      image: '😊',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Das schmeckt nicht.' },
        { id: 'b', german: 'Hilfe!' },
        { id: 'c', german: 'Danke schön!' },
      ],
      correctId: 'c',
    },
    {
      id: 'pay',
      contextKey: 'cm.cafe.pay',
      image: '💶',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Die Rechnung, bitte.' },
        { id: 'b', german: 'Ich fliege nach Hause.' },
        { id: 'c', german: 'Guten Appetit… für dich.' },
      ],
      correctId: 'a',
    },
    {
      id: 'bye',
      contextKey: 'cm.cafe.bye',
      image: '👋',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Guten Morgen!' },
        { id: 'b', german: 'Auf Wiedersehen! Schönen Tag noch.' },
        { id: 'c', german: 'Mein Name ist Tisch.' },
      ],
      correctId: 'b',
    },
  ],
};

export function getDefaultMission(): ConversationMission {
  return CAFE_GREETING_MISSION;
}

export function buildSession(
  mission: ConversationMission = CAFE_GREETING_MISSION,
): ConversationBeat[] {
  return mission.beats;
}
