import Head from 'next/head';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import styles from '../styles/Home.module.css';
import { Dropdown } from './components/Dropdown';

type Game = { teams: [string, string]; score: [number, number] | null };

export default function Home() {
  const [teams, setTeams] = useState(['Spanien', 'Deutschland', 'Japan', 'Costa Rica']);
  const [selected, setSelected] = useState('Select Score');

  const [games, setGames] = useState(() => {
    const games: Game[] = [];
    for (let i = 0; i < teams.length - 1; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        games.push({ teams: [teams[i], teams[j]], score: null });
      }
    }
    return games;
  });

  const onSelect = (changedGame: Game) => {
    setGames(games.map((game) => (game.teams.every((team) => changedGame.teams.includes(team)) ? changedGame : game)));
  };

  // const permutator = (inputArr) => {
  // 	let result = [];

  // 	const permute = (arr, m = []) => {
  // 		if (arr.length === 0) {
  // 			result.push(m);
  // 		} else {
  // 			for (let i = 0; i < arr.length; i++) {
  // 				let curr = arr.slice();
  // 				let next = curr.splice(i, 1);
  // 				permute(curr.slice(), m.concat(next));
  // 			}
  // 		}
  // 	};

  // 	permute(inputArr);

  // 	return result;
  // };

  const possibleScores = [
    [3, 0],
    [1, 1],
    [0, 3],
  ];
  const calculateRoundRobinPermutations = useMemo(() => {
    const resolvedIdxs = [];
    const unresolvedGames = games.filter((game, idx) => {
      if (!game.score) {
        return true;
      }
      resolvedIdxs.push(idx);
      return false;
    });
    const numberOfScores = Math.pow(possibleScores.length, unresolvedGames.length);
    const finalScores = [];

    let count = 0;
    while (count < numberOfScores) {
      const base3 = count.toString(3).padStart(unresolvedGames.length, '0');
      const scores = base3.split('').map((n) => possibleScores[parseInt(n)]);
      resolvedIdxs.forEach((idx) => {
        scores.splice(idx, 0, games[idx].score);
      });
      let obj = {};
      games.forEach((game, gameIdx) => {
        game.teams.forEach((team, index) => {
          obj[team] = obj[team] || 0;
          obj[team] += scores[gameIdx][index];
        });
      });
      finalScores.push(obj);
      count++;
    }

    return {
      finalScores,
      numberOfScores,
      total: finalScores.length,
      statistics: {
        ...teams.reduce(
          (prev, curr) => ({
            ...prev,
            [curr]: [
              finalScores.reduce((prevScore, currScore) => {
                const teamScore = currScore[curr];
                const out =
                  Object.entries(currScore)
                    .filter(([team]) => team !== curr)
                    .filter(([team, score]) => {
                      return teamScore > score;
                    }).length >= 2;

                const draw =
                  Object.entries(currScore)
                    .filter(([team]) => team !== curr)
                    .filter(([team, score]) => {
                      return teamScore >= score;
                    }).length >= 2;
                return {
                  out: (prevScore.out || 0) + (out ? 1 : 0),
                  draw: (prevScore.draw || 0) + (draw && !out ? 1 : 0),
                  lost: (prevScore.lost || 0) + (!draw && !out ? 1 : 0),
                };
              }, {}),
            ].reduce((_, obj) => {
              return {
                win: ((obj.out / finalScores.length) * 100).toFixed(2),
                draw: ((obj.draw / finalScores.length) * 100).toFixed(2),

                lost: ((obj.lost / finalScores.length) * 100).toFixed(2),
              };
            }, {}),
          }),
          {},
        ),
      },
    };
  }, [games]);
  // .filter(
  // 	({ A, B, C, D }) =>
  // 		// (A >= 3 &&
  // 		(A >= B && B >= C && B >= D) ||
  // 		(A >= C && C >= B && C >= D) ||
  // 		(A >= D && D >= B && D >= C) ||
  // 		(A <= B && A >= C && A >= D) ||
  // 		(A <= C && A >= B && A >= D) ||
  // 		(A <= D && A >= B && A >= C)
  // ).length

  const matches = teams.map((team) => games.filter((game) => game.teams.includes(team)));
  console.log(matches);

  return (
    <div className={styles.container}>
      <Head>
        <title>Round Robin Calculator</title>
        <meta name='description' content='Done by Mauce' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <div className='flex gap-4'>
          {matches.map((match, index) => (
            <div className='flex flex-col gap-2' key={teams[index]}>
              <input
                className='block w-full text-lg font-bold rounded-md border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500'
                placeholder='Team Name'
                value={teams[index].toString()}
              />
              {match.map((match) => {
                const i = match.teams.findIndex((value) => value === teams[index]);
                const sortedTeams = !i ? [...match.teams] : [...match.teams].reverse();
                const sortedScore = match.score && (!i ? [...match.score] : [...match.score].reverse());
                return (
                  <div key={sortedTeams.toString()}>
                    <div>{sortedTeams.join(' vs ')}</div>
                    <Dropdown
                      options={[...possibleScores, null]}
                      selected={sortedScore || undefined}
                      setSelected={(value) => onSelect({ teams: sortedTeams, score: value })}
                    />
                  </div>
                );
              })}
              <div>Win: {calculateRoundRobinPermutations.statistics[teams[index]].win} %</div>
              <div>Draw: {calculateRoundRobinPermutations.statistics[teams[index]].draw} %</div>
            </div>
          ))}
          {/* <button onClick={() => alert('Team added')}>Add Team</button> */}
        </div>
        {/* <div> {JSON.stringify(calculateRoundRobinPermutations, null, 2)}</div> */}
      </main>

      <footer className={styles.footer}>
        <a
          href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
