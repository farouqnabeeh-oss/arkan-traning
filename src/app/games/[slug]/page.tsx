import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

// Game components
import FlexboxDefender from '@/components/games/FlexboxDefender';
import CssBattle from '@/components/games/CssBattle';
import PythonSnake from '@/components/games/PythonSnake';
import RpsAi from '@/components/games/RpsAi';
import TicTacToe from '@/components/games/TicTacToe';
import MemoryCard from '@/components/games/MemoryCard';
import CodeTyper from '@/components/games/CodeTyper';
import AlgorithmPuzzle from '@/components/games/AlgorithmPuzzle';
import RegexHunter from '@/components/games/RegexHunter';
import SqlDuel from '@/components/games/SqlDuel';
import GitRace from '@/components/games/GitRace';
import DebuggingDetective from '@/components/games/DebuggingDetective';

interface Props {
  params: {
    slug: string;
  };
}

export default async function GamePage({ params }: Props) {
  const user = await getSessionUser();
  const slug = params.slug;

  const renderGame = () => {
    switch (slug) {
      case 'flexbox-defender':
        return <FlexboxDefender user={user} gameSlug={slug} />;
      case 'css-battle':
        return <CssBattle user={user} gameSlug={slug} />;
      case 'python-snake':
        return <PythonSnake user={user} gameSlug={slug} />;
      case 'rps-ai':
        return <RpsAi user={user} gameSlug={slug} />;
      case 'tic-tac-toe':
        return <TicTacToe user={user} gameSlug={slug} />;
      case 'memory-card':
        return <MemoryCard user={user} gameSlug={slug} />;
      case 'code-typer':
        return <CodeTyper user={user} gameSlug={slug} />;
      case 'algorithm-puzzle':
        return <AlgorithmPuzzle user={user} gameSlug={slug} />;
      case 'regex-hunter':
        return <RegexHunter user={user} gameSlug={slug} />;
      case 'sql-duel':
        return <SqlDuel user={user} gameSlug={slug} />;
      case 'git-race':
        return <GitRace user={user} gameSlug={slug} />;
      case 'debugging-detective':
        return <DebuggingDetective user={user} gameSlug={slug} />;
      default:
        return null;
    }
  };

  const gameComponent = renderGame();

  if (!gameComponent) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {gameComponent}
      </main>
      <Footer />
    </div>
  );
}
