
i18n.map('en', {
  userSummary: {
    number: 'Matches',
    progress: 'Progress',
    surname: 'Surname',
    name: 'Name',
    email: 'Email',
    residenceCountry: 'Country of Residence',
    accountType: 'Account Type',
    accountTypePersonal: 'Individual',
    accountTypeCompany: 'Corporation',
    levels: 'Compliance Tier (Old/New)',
    indicators: 'Indicators',
    currentReviewer: 'Current Reviewer',
    review: 'Review',
    unwatch: 'Unwatch',
    commissionWallet: 'Commission Wallet',
    unwatchUserModal: {
      message: 'Are you sure you want to unwatch {$1}?',
      confirm: 'Unwatch {$1}',
      cancel: 'Cancel'
    },
    takeOverRevieweeModal: {
      message: `This user is currently being reviewed by someone else.
                Do you want to take over the review process?<br>
                User: {$1}<br>
                Compliance Officer: {$2}`,
      confirm: 'Yes',
      cancel: 'No'
    },
    errors: {
      unauthorized: 'Unauthorized',
      couldNotAddReviewee: 'Could not add reviewee',
      userNotFound: 'User not found'
    }
  }
});

i18n.map('ja', {
  userSummary: {
    number: '一致',
    progress: '進捗状況',
    surname: '姓',
    name: '名',
    email: 'メールアドレス',
    residenceCountry: '居住国',
    accountType: 'アカウントの種類',
    accountTypePersonal: '個人',
    accountTypeCompany: '法人',
    levels: 'コンプラインス種別（旧/新)',
    indicators: 'インジケーター',
    currentReviewer: '承認作業中ユーザー',
    review: '確認',
    unwatch: '監視停止',
    commissionWallet: 'コミッションウォレット',
    unwatchUserModal: {
      message: '本当に {$1} の監視をやめますか？',
      confirm: '{$1}の監視をやめる',
      cancel: 'キャンセル'
    },
    takeOverRevieweeModal: {
      message: `このユーザーは他のスタッフが閲覧中です。
                閲覧しますか？<br>
                ユーザー: {$1}<br>
                コンプライアンススタッフ: {$2}`,
      confirm: 'はい',
      cancel: 'いいえ'
    },
    errors: {
      unauthorized: '許可がありません。',
      couldNotAddReviewee: '承認対象者を追加できません。',
      userNotFound: 'ユーザーが見つかりませんでした。'
    }
  }
});

i18n.map('ko', {
  userSummary: {
    number: '일치 항목',
    progress: '진척 상황',
    surname: '성',
    name: '이름',
    email: '메일 어드레스',
    residenceCountry: '거주 국가',
    accountType: '계정 종류',
    accountTypePersonal: '개인',
    accountTypeCompany: '법인',
    levels: '컴플라이언스 레벨1 (구/신)',
    indicators: '지표',
    currentReviewer: '승인 작업 중인 유저',
    review: '확인',
    unwatch: '감시 정지',
    commissionWallet: '커미션 월렛',
    unwatchUserModal: {
      message: '정말로 {$1} 의 감시를 그만두겠습니까?',
      confirm: '{$1} 의 감시를 그만둡니다.',
      cancel: '캔슬'
    },
    takeOverRevieweeModal: {
      message: `이 유저는 다른 스텝이 열람 중입니다.
                열람하시겠습니까? <br>
                유저 : {$ 1} <br>
                컴플라이언스 스텝 : {$ 2}`,
      confirm: '네',
      cancel: '아니오'
    },
    errors: {
      unauthorized: '권한이 없음',
      couldNotAddReviewee: '승인대상자를 첨가할 수 없습니다.',
      userNotFound: '이용자를 찾을 수 없습니다.'
    }
  }
});

i18n.map('zh', {
  userSummary: {
    number: '一致项目',
    progress: '进度',
    surname: '姓',
    name: '名',
    email: '电邮',
    residenceCountry: '居住国',
    accountType: '帐户种类',
    accountTypePersonal: '个人',
    accountTypeCompany: '公司',
    levels: '身份确认状况(旧/新)',
    indicators: '指标',
    currentReviewer: '正在承认工作人员',
    review: '承认',
    unwatch: '取消阅览',
    commissionWallet: '佣金钱包',
    unwatchUserModal: {
      message: '确认取消阅览 {$1}?',
      confirm: '取消阅览 {$1}',
      cancel: '取消'
    },
    takeOverRevieweeModal: {
      message: `此用户现正被其他人浏览。
                确认要取代浏览吗？<br>
                用户: {$1}<br>
                认证人员: {$2}`,
      confirm: '是',
      cancel: '否'
    },
    errors: {
      unauthorized: '未得到授权',
      couldNotAddReviewee: '未能增加待承认者',
      userNotFound: '用户不存在'
    }
  }
});
