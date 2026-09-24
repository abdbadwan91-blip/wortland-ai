import { AppProvider, useApp } from './modules/Auth/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { LanguageScreen } from './screens/LanguageScreen';
import { NameScreen } from './screens/NameScreen';
import { AvatarScreen } from './screens/AvatarScreen';
import { ModeScreen } from './screens/ModeScreen';
import { EmailScreen } from './screens/EmailScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LevelWheelScreen } from './screens/LevelWheelScreen';
import { TopicPickerScreen } from './screens/TopicPickerScreen';
import { GameModesScreen } from './screens/GameModesScreen';
import { ArenaStubScreen } from './screens/ArenaStubScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StubScreen } from './screens/StubScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { PictureMatchArenaScreen } from './screens/PictureMatchArenaScreen';
import { QuickPickArenaScreen } from './screens/QuickPickArenaScreen';
import { ArticlePickArenaScreen } from './screens/ArticlePickArenaScreen';
import { ClassicCardsArenaScreen } from './screens/ClassicCardsArenaScreen';
import { MemoryFlipArenaScreen } from './screens/MemoryFlipArenaScreen';
import { BuildItArenaScreen } from './screens/BuildItArenaScreen';
import { MasterChallengeArenaScreen } from './screens/MasterChallengeArenaScreen';
import { ListeningHuntArenaScreen } from './screens/ListeningHuntArenaScreen';
import { SpeedRoundArenaScreen } from './screens/SpeedRoundArenaScreen';
import { WordPuzzleArenaScreen } from './screens/WordPuzzleArenaScreen';
import { ConversationMissionArenaScreen } from './screens/ConversationMissionArenaScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { GamesHubScreen } from './screens/GamesHubScreen';

function Router() {
  const { screen } = useApp();

  switch (screen) {
    case 'splash':
      return <SplashScreen />;
    case 'language':
      return <LanguageScreen />;
    case 'name':
      return <NameScreen />;
    case 'avatar':
      return <AvatarScreen />;
    case 'mode':
      return <ModeScreen />;
    case 'email':
      return <EmailScreen />;
    case 'home':
      return <HomeScreen />;
    case 'levelWheel':
      return <LevelWheelScreen />;
    case 'topicPicker':
      return <TopicPickerScreen />;
    case 'gameModes':
      return <GameModesScreen />;
    case 'arenaStub':
      return <ArenaStubScreen />;
    case 'pictureMatch':
      return <PictureMatchArenaScreen />;
    case 'quickPick':
      return <QuickPickArenaScreen />;
    case 'articlePick':
      return <ArticlePickArenaScreen />;
    case 'classicCards':
      return <ClassicCardsArenaScreen />;
    case 'memoryFlip':
      return <MemoryFlipArenaScreen />;
    case 'buildIt':
      return <BuildItArenaScreen />;
    case 'masterChallenge':
      return <MasterChallengeArenaScreen />;
    case 'listeningHunt':
      return <ListeningHuntArenaScreen />;
    case 'speedRound':
      return <SpeedRoundArenaScreen />;
    case 'wordPuzzle':
      return <WordPuzzleArenaScreen />;
    case 'conversationMission':
      return <ConversationMissionArenaScreen />;
    case 'family':
      return <FamilyScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'learn':
      return <StubScreen which="learn" />;
    case 'games':
      return <GamesHubScreen />;
    case 'progress':
      return <ProgressScreen />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="app-shell">
        <div className="app-frame">
          <Router />
        </div>
      </div>
    </AppProvider>
  );
}
