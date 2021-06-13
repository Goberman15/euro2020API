const router = require('express').Router();
const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

router.get('/', (_, res) => {
    res.json({
        author: 'Akbar Ramadhan'
    });
});

router.get('/matches', async (_, res) => {
    try {
        const { data } = await axios.get(
            'https://match.uefa.com/v2/matches?competitionId=3&offset=0&limit=51'
        );
        const matchData = [];
        data.reverse().forEach((match) => {
            let matchObj = {
                id: match.id,
                matchNumber: match.matchNumber,
                round: match.round.translations.name.EN,
                mathcTime: match.kickOffTime.dateTime,
                homeTeam: match.homeTeam.internationalName,
                awayTeam: match.awayTeam.internationalName,
                stadium: match.stadium.translations.officialName.EN,
                city: match.stadium.city.translations.name.EN
            };

            matchData.push(matchObj);
        });

        res.status(200).json({
            matchData
        });
    } catch (error) {
        res.status(500).json({
            error
        });
    }
});

router.get('/standings', async (_, res) => {
    try {
        const { data } = await axios.get(
            'https://standings.uefa.com/v1/standings?groupIds=2006438,2006439,2006440,2006441,2006442,2006443'
        );

        const groupStandings = [];
        data.forEach((groupData) => {
            let groupObj = {
                groupName: groupData.group.metaData.groupName,
                teams: []
            };

            let teams = groupData.items.map(
                ({
                    team,
                    rank,
                    played,
                    won,
                    lost,
                    drawn,
                    points,
                    goalsFor,
                    goalsAgainst,
                    goalDifference
                }) => ({
                    name: team.internationalName,
                    rank,
                    played,
                    won,
                    drawn,
                    lost,
                    points,
                    goalsFor,
                    goalsAgainst,
                    goalDifference
                })
            );

            groupObj.teams = teams;

            groupStandings.push(groupObj);
        });

        res.status(200).json({
            groupStandings
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/matches/:match_id', async (req, res) => {
    const { match_id } = req.params;

    try {
        const {
            data: [matchData]
        } = await axios.get(
            `https://match.uefa.com/v2/matches?matchId=${match_id}&offset=0&limit=1`
        );
        const matchObj = {
            homeTeam: matchData.homeTeam.internationalName,
            awayTeam: matchData.awayTeam.internationalName,
            minutes: matchData.minute && matchData.minute.normal,
            round: matchData.round.translations.name.EN,
            score: matchData.score,
            referees: matchData.referees.map(ref => {
                return {
                    name: ref.person.translations.name.EN,
                    role: ref.translations.roleName.EN
                }
            }),
            goalScorer: matchData.playerEvents && matchData.playerEvents.scorers.map(scorer => {
                return {
                    name: scorer.player.internationalName,
                    team: scorer.player.translations.countryName.EN,
                    type: scorer.goalType,
                    time: scorer.time,
                    scorer: scorer.totalScore
                }
            }),
            status: matchData.status,
            kickOff: matchData.kickOffTime
        }

        res.status(200).json({
            matchObj
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro
        });
    }
});

router.get('/teams', async (_, res) => {
    const teams = await readFile('./euroTeamData.json', 'utf8');

    res.status(200).json({
        teams: JSON.parse(teams)
    });
});

module.exports = router;
