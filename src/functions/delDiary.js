const { app } = require('@azure/functions');
const mysql = require('mysql');
const moment = require('moment-timezone');
require('dotenv').config();

app.timer('delDiary', {
    // schedule: '0 */1 * * * *', // 3분마다
    매일 오전 12시에 실행
    // schedule: '0 0 0 * * *',
    timezone: 'Asia/Seoul',
    handler: (myTimer, context) => {
        context.log('Timer function processed request.');

        // Azure Database for MySQL 연결 정보
        const connectionConfig = {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            ssl: true
        };

        const connection = mysql.createConnection(connectionConfig);

        // 타이머 트리거 실행 시간 출력
        context.log('Timer trigger function ran!', myTimer);

        // 현재 날짜 및 시간 가져오기 (한국 시간으로)
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        context.log(`현재날짜:  ${currentDate}`);

        // 데이터베이스 쿼리 실행
        connection.query('UPDATE diaries SET deleted = "completed" WHERE deleted = "scheduled" and delete_at < ?', [currentDate], function (error, results, fields) {
            if (error) {
                context.log.error(error);
                throw error;
            }

            context.log(`Updated ${results.affectedRows} rows in Diary table.`);
        });

        // 데이터베이스 연결 닫기
        connection.end();
    }
});
