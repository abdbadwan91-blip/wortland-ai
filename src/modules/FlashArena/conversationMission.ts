/**
 * Conversation Mission — guided mini-scene (stub).
 * Not full dialogue AI: 5–8 scripted beats, pick best German reply from 3 choices.
 */

export interface ConversationChoice {
  id: string;
  /** German reply shown on the button (content, not i18n) */
  german: string;
  /** Compact translation fallback; UI language packs can replace this later. */
  translation?: string;
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
        { id: 'a', german: 'Guten Tag!', translation: 'مرحباً!' },
        { id: 'b', german: 'Gute Nacht!', translation: 'تصبح على خير!' },
        { id: 'c', german: 'Auf Wiedersehen!', translation: 'إلى اللقاء!' },
      ],
      correctId: 'a',
    },
    {
      id: 'seat',
      contextKey: 'cm.cafe.seat',
      image: '🪑',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Nein, danke.', translation: 'لا، شكراً.' },
        { id: 'b', german: 'Ja, bitte. Einen Tisch für eine Person.', translation: 'نعم، من فضلك. طاولة لشخص واحد.' },
        { id: 'c', german: 'Ich bin ein Hund.', translation: 'أنا كلب.' },
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
        { id: 'a', german: 'Einen Kaffee, bitte.', translation: 'قهوة من فضلك.' },
        { id: 'b', german: 'Ich schlafe jetzt.', translation: 'أنا أنام الآن.' },
        { id: 'c', german: 'Wo ist der Bahnhof?', translation: 'أين محطة القطار؟' },
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
        { id: 'a', german: 'Das ist mein Auto.', translation: 'هذه سيارتي.' },
        { id: 'b', german: 'Und ein Stück Kuchen, bitte.', translation: 'وقطعة كعك من فضلك.' },
        { id: 'c', german: 'Ich habe Hunger… nach Schuhen.', translation: 'أنا جائع... للأحذية.' },
      ],
      correctId: 'b',
    },
    {
      id: 'thanks',
      contextKey: 'cm.cafe.thanks',
      image: '😊',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Das schmeckt nicht.', translation: 'هذا لا طعم له جيداً.' },
        { id: 'b', german: 'Hilfe!', translation: 'النجدة!' },
        { id: 'c', german: 'Danke schön!', translation: 'شكراً جزيلاً!' },
      ],
      correctId: 'c',
    },
    {
      id: 'pay',
      contextKey: 'cm.cafe.pay',
      image: '💶',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Die Rechnung, bitte.', translation: 'الحساب من فضلك.' },
        { id: 'b', german: 'Ich fliege nach Hause.', translation: 'أنا أطير إلى المنزل.' },
        { id: 'c', german: 'Guten Appetit… für dich.', translation: 'شهية طيبة... لك.' },
      ],
      correctId: 'a',
    },
    {
      id: 'bye',
      contextKey: 'cm.cafe.bye',
      image: '👋',
      imageKind: 'emoji',
      choices: [
        { id: 'a', german: 'Guten Morgen!', translation: 'صباح الخير!' },
        { id: 'b', german: 'Auf Wiedersehen! Schönen Tag noch.', translation: 'إلى اللقاء! أتمنى لك يوماً سعيداً.' },
        { id: 'c', german: 'Mein Name ist Tisch.', translation: 'اسمي طاولة.' },
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
