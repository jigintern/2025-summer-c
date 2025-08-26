import { queryJson } from '../../utils/api.ts';

// 年代と領域の両方を指定して検索するテスト
async function testQueryWithAllParams() {
    console.log("--- 複合検索テスト ---");

    const params = {
        area: {
            x1: 136.1,
            y1: 35.9,
            x2: 136.2,
            y2: 36.0,
        },
        decade: {
            gt: 2010,
            lte: 2020,
        }
    };

    const result = await queryJson(params);
    console.log('取得結果:', result);
}

// テスト実行
testQueryWithAllParams();