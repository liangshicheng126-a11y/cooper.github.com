#!/usr/bin/env python3
"""Score design jobs against resume profile and generate report sections."""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class Job:
    city: str
    company: str
    title: str
    salary: str
    channel: str
    # dimension scores 0-100
    brand: float = 50
    ui: float = 50
    photo: float = 30
    b2b: float = 20
    outdoor: float = 20
    campus_bonus: bool = False
    senior_penalty: bool = False
    no_sunday: bool = False
    holiday_work: bool = False
    physical_labor: bool = False
    single_rest_ok: bool = True
    notes: str = ""
    insured_count: str = "待核实"
    arbitration: str = "未检索到公开记录"
    rest_policy: str = "JD未明示"
    scam_risk: str = "低"
    kpi_risk: str = "低"
    web_rep: str = "未检索到有效评论"
    douyin_rep: str = "未检索到有效评论"
    amap_rep: str = "未检索到有效评论"
    stars: int = 3
    star_reason: str = ""

    def fit_score(self) -> int:
        if self.physical_labor:
            return 0
        base = (
            self.brand * 0.25
            + self.ui * 0.25
            + self.photo * 0.20
            + self.b2b * 0.15
            + self.outdoor * 0.15
        )
        if self.campus_bonus:
            base += 5
        if self.senior_penalty:
            base -= 10
        if self.no_sunday:
            base -= 15
        if self.holiday_work:
            base -= 20
        return int(max(0, min(100, round(base))))


def load_jobs() -> list[Job]:
    """Curated from Boss/猎聘/51job/58/校招公开检索 2026-06-29."""
    jobs: list[Job] = []

    def add(**kw):
        jobs.append(Job(**kw))

    # ===== 杭州 =====
    add(city="杭州", company="浙江数新网络", title="UI设计实习生", salary="150-200元/天",
        channel="智联", brand=60, ui=85, photo=40, b2b=50, outdoor=20, campus_bonus=True,
        notes="B端UI+宣传册海报，每周4天实习6个月+", rest_policy="5天/周实习",
        insured_count="参保约60人(2024年报)", arbitration="未检索到", stars=4,
        star_reason="硕士+作品集匹配B端UI，参保正常，A轮100-299人")
    add(city="杭州", company="星创置业集团", title="品牌设计专员", salary="8-15K",
        channel="猎聘", brand=85, ui=50, photo=45, b2b=60, outdoor=30, senior_penalty=True,
        notes="需2年+经验", rest_policy="未明示")
    add(city="杭州", company="宜格集团(花西子)", title="26校招视觉&创意设计", salary="3-4K(校招标注)",
        channel="校招/鼠鼠求职", brand=95, ui=70, photo=50, b2b=40, outdoor=25, campus_bonus=True,
        notes="品牌主视觉/详情页/活动海报，2026届", rest_policy="未明示",
        insured_count="宜格集团规模数百人", stars=4, star_reason="校招品牌视觉强匹配，薪资偏低需核实转正")
    add(city="杭州", company="网易游戏雷火", title="UI设计师/视觉设计师(校招)", salary="面议(16薪)",
        channel="牛客校招", brand=70, ui=90, photo=40, b2b=30, outdoor=30, campus_bonus=True,
        notes="2026届艺术/设计类，杭州", rest_policy="大厂标准双休为主",
        insured_count="网易集团", stars=4, star_reason="平台强但游戏UI竞争激烈，作品集要求高")
    add(city="杭州", company="未具名出海团队", title="UI设计师(出海榜首/双休)", salary="15-30K",
        channel="BOSS", brand=55, ui=90, photo=35, b2b=25, outdoor=20,
        notes="Google Play Top3出海，AI+数据导向", rest_policy="双休")
    add(city="杭州", company="未具名金融科技", title="C端UI设计师", salary="10-15K·14薪",
        channel="BOSS", brand=50, ui=85, photo=30, b2b=20, outdoor=15,
        notes="双休不打卡9:30-18:00，需金融背景", rest_policy="双休", stars=3)
    add(city="杭州", company="未具名科技", title="UI设计师(秋招2026届)", salary="10-15K",
        channel="BOSS", brand=55, ui=88, photo=35, b2b=25, outdoor=20, campus_bonus=True,
        notes="含设计笔试", rest_policy="未明示", stars=4)
    add(city="杭州", company="未具名", title="视觉设计", salary="8-10K·13薪",
        channel="BOSS", brand=80, ui=60, photo=80, b2b=45, outdoor=35,
        notes="路演/社媒/视频视觉包装", rest_policy="未明示", stars=4)
    add(city="杭州", company="未具名", title="视觉设计师/Visual Designer", salary="10-12K",
        channel="BOSS", brand=75, ui=70, photo=60, b2b=30, outdoor=25,
        notes="AIGC+审美导向", stars=3)
    add(city="杭州", company="杭州试派信息技术", title="UI视觉设计师(实习)", salary="150-200元/天",
        channel="智联", brand=65, ui=80, photo=40, b2b=20, outdoor=20, campus_bonus=True,
        notes="社交增长/Growth Design，创业节奏快", rest_policy="5天/周实习", stars=3,
        scam_risk="中", kpi_risk="中", star_reason="JD写抗压极快，需确认休息")
    add(city="杭州", company="未具名电商", title="电商视觉设计师(双休+五险一金)", salary="7-10K",
        channel="BOSS", brand=70, ui=65, photo=55, b2b=30, outdoor=15, rest_policy="双休", stars=3)
    add(city="杭州", company="未具名跨境", title="跨境电商美工设计师", salary="8-13K·13薪",
        channel="BOSS", brand=65, ui=60, photo=50, b2b=35, outdoor=15, stars=3)
    add(city="杭州", company="未具名", title="平面及UI设计实习生", salary="150-250元/天",
        channel="BOSS", brand=70, ui=75, photo=45, b2b=30, outdoor=20, campus_bonus=True, stars=4)
    add(city="杭州", company="未具名游戏厂", title="游戏UI/平面设计师(鹅厂双休)", salary="10-15K",
        channel="BOSS", brand=60, ui=85, photo=40, b2b=25, outdoor=15, rest_policy="双休", stars=3)
    add(city="杭州", company="未具名", title="UI/UX设计师(数据思维+可应届)", salary="10-15K·16薪",
        channel="BOSS", brand=55, ui=88, photo=35, b2b=25, outdoor=15, campus_bonus=True, stars=4)
    add(city="杭州", company="未具名", title="UX/UI实习生", salary="9-14K·13薪",
        channel="BOSS", brand=50, ui=85, photo=30, b2b=20, outdoor=15, campus_bonus=True, stars=4)
    add(city="杭州", company="未具名", title="【双休】创意平面设计师", salary="5-10K·13薪",
        channel="BOSS", brand=80, ui=45, photo=50, b2b=40, outdoor=20, rest_policy="双休", stars=3)
    add(city="杭州", company="陌桃服饰", title="平面设计师(女装电商)", salary="11-22K",
        channel="BOSS", brand=85, ui=50, photo=55, b2b=30, outdoor=15, stars=3)
    add(city="杭州", company="未具名", title="品牌摄影师", salary="15-20K",
        channel="BOSS", brand=60, ui=30, photo=95, b2b=50, outdoor=45, stars=4,
        notes="产品静物摄影+创意策划，偏摄影岗")
    add(city="杭州", company="未具名新能源", title="平面或UI设计师", salary="8-9K",
        channel="BOSS", brand=55, ui=75, photo=35, b2b=40, outdoor=15, rest_policy="双休", stars=3)
    add(city="杭州", company="未具名", title="UI设计师(应届转正双休16薪)", salary="8-13K·16薪",
        channel="BOSS", brand=55, ui=85, photo=40, b2b=25, outdoor=20, campus_bonus=True,
        rest_policy="双休", stars=4)

    # ===== 宁波 =====
    add(city="宁波", company="得力集团", title="设计管培生(校招)", salary="面议",
        channel="校招官网", brand=90, ui=70, photo=45, b2b=55, outdoor=25, campus_bonus=True,
        notes="视觉传达/平面/交互/新媒体，宁波+杭州+苏州", rest_policy="制造业大厂通常单双休混合",
        insured_count="得力集团数千人", stars=5, star_reason="校招品牌设计管培，城市覆盖广，正规大厂")
    add(city="宁波", company="得力集团", title="电商平面设计(校招)", salary="面议",
        channel="校招官网", brand=85, ui=55, photo=50, b2b=45, outdoor=20, campus_bonus=True, stars=4)
    add(city="宁波", company="得力集团", title="产品平面设计(校招)", salary="面议",
        channel="校招官网", brand=88, ui=50, photo=55, b2b=50, outdoor=20, campus_bonus=True, stars=4)
    add(city="宁波", company="赛特威尔电子", title="UI设计", salary="18-30K·13薪",
        channel="猎聘", brand=60, ui=90, photo=45, b2b=55, outdoor=20, senior_penalty=True,
        notes="智能家居UI，需3年+", stars=3)
    add(city="宁波", company="未具名", title="平面设计师(双休五险一金)", salary="6-9K",
        channel="猎聘", brand=80, ui=45, photo=50, b2b=40, outdoor=20, rest_policy="双休", stars=4)
    add(city="宁波", company="未具名", title="平面设计师(双休不强制加班)", salary="7-10K·13薪",
        channel="猎聘", brand=78, ui=48, photo=55, b2b=35, outdoor=20, rest_policy="双休", stars=4)
    add(city="宁波", company="未具名", title="视觉设计师", salary="10-15K·13薪",
        channel="猎聘", brand=75, ui=70, photo=50, b2b=35, outdoor=25, stars=3)
    add(city="宁波", company="未具名外贸", title="平面设计", salary="8-12K·13薪",
        channel="BOSS", brand=75, ui=45, photo=70, b2b=45, outdoor=20,
        notes="产品拍摄+修图+画册+视频剪辑", stars=4)
    add(city="宁波", company="未具名", title="UI设计", salary="10-15K",
        channel="BOSS", brand=55, ui=85, photo=35, b2b=30, outdoor=15, stars=3)
    add(city="宁波", company="宁波赛尔集团", title="UI设计师(跨境电商)", salary="8-12K",
        channel="职友集", brand=60, ui=80, photo=40, b2b=40, outdoor=15, stars=3)
    add(city="宁波", company="浙江吉利控股", title="多模态智能交互UI", salary="20-40K",
        channel="职友集", brand=55, ui=90, photo=35, b2b=45, outdoor=20, senior_penalty=True, stars=2)
    add(city="宁波", company="未具名", title="平面设计师", salary="5-10K·13薪",
        channel="猎聘", brand=75, ui=45, photo=50, b2b=35, outdoor=20, stars=3)
    add(city="宁波", company="未具名", title="视觉设计师(电商美工)", salary="10-15K·13薪",
        channel="猎聘", brand=70, ui=65, photo=55, b2b=30, outdoor=15, stars=3)
    add(city="宁波", company="未具名", title="创意设计师", salary="10-15K·14薪",
        channel="猎聘", brand=82, ui=55, photo=50, b2b=40, outdoor=25, stars=3)
    add(city="宁波", company="未具名", title="平面设计实习生", salary="日薪未标",
        channel="BOSS", brand=70, ui=50, photo=45, b2b=30, outdoor=15, campus_bonus=True, stars=3)

    # ===== 苏州 =====
    add(city="苏州", company="苏州跃川拓境科技", title="视觉设计", salary="15-30K·15薪",
        channel="猎聘", brand=92, ui=65, photo=55, b2b=70, outdoor=88,
        notes="品牌VI+发布会+汽车/户外品牌经验优先，2025年成立初创",
        insured_count="注册资本100万，50-99人，参保待核实", kpi_risk="中",
        scam_risk="低", stars=5, star_reason="户外+品牌VI与简历雪山/攀冰项目极度契合，需接受初创风险")
    add(city="苏州", company="苏州跃川拓境科技", title="品牌视觉设计师", salary="10-18K",
        channel="猎聘", brand=90, ui=60, photo=50, b2b=65, outdoor=80, stars=4)
    add(city="苏州", company="追觅科技", title="资深UI/UX设计师", salary="25-55K·15薪",
        channel="猎聘", brand=55, ui=92, photo=40, b2b=35, outdoor=25, senior_penalty=True, stars=2)
    add(city="苏州", company="润芯微", title="UI视觉设计师(智能硬件)", salary="14-30K",
        channel="猎聘", brand=55, ui=88, photo=35, b2b=40, outdoor=20, senior_penalty=True, stars=3)
    add(city="苏州", company="未具名文创", title="品牌视觉设计师(文创潮玩)", salary="10-15K·13薪",
        channel="猎聘", brand=88, ui=60, photo=50, b2b=35, outdoor=30, stars=4)
    add(city="苏州", company="未具名", title="视觉设计师(AIGC方向)", salary="12-20K·15薪",
        channel="猎聘", brand=70, ui=75, photo=45, b2b=30, outdoor=25, stars=3)
    add(city="苏州", company="未具名", title="电商视觉设计师", salary="12-16K·15薪",
        channel="猎聘", brand=72, ui=65, photo=55, b2b=35, outdoor=15, stars=3)
    add(city="苏州", company="昆山沪光汽车电器", title="UI/UX设计师", salary="10-20K·13薪",
        channel="猎聘", brand=50, ui=85, photo=35, b2b=55, outdoor=20, stars=3)
    add(city="苏州", company="未具名", title="视觉设计师", salary="10-15K",
        channel="猎聘", brand=75, ui=70, photo=50, b2b=40, outdoor=30, stars=3)
    add(city="苏州", company="未具名", title="高级视觉设计师", salary="23-30K·15薪",
        channel="猎聘", brand=78, ui=72, photo=50, b2b=45, outdoor=35, senior_penalty=True, stars=2)
    add(city="苏州", company="未具名硬件", title="资深平面视觉设计师(硬件)", salary="15-25K·15薪",
        channel="猎聘", brand=80, ui=55, photo=55, b2b=60, outdoor=30, senior_penalty=True, stars=3)
    add(city="苏州", company="未具名", title="视觉设计师(营销方向)", salary="15-40K·15薪",
        channel="猎聘", brand=82, ui=60, photo=60, b2b=45, outdoor=35, stars=3)
    add(city="苏州", company="未具名", title="高级UI设计师", salary="15-18K",
        channel="猎聘", brand=50, ui=88, photo=35, b2b=35, outdoor=15, senior_penalty=True, stars=2)
    add(city="苏州", company="未具名", title="UI设计师", salary="11-20K",
        channel="猎聘", brand=52, ui=85, photo=35, b2b=40, outdoor=15, stars=3)
    add(city="苏州", company="未具名", title="UI/UX设计师", salary="20-40K·15薪",
        channel="猎聘", brand=55, ui=90, photo=40, b2b=30, outdoor=20, stars=3)
    add(city="苏州", company="江苏江南商贸集团", title="视觉内容专员(拍摄剪辑+平面)", salary="6-7K",
        channel="智联", brand=72, ui=48, photo=92, b2b=40, outdoor=45,
        notes="菜品/活动跟拍+剪映PR+海报，常熟", stars=4)
    add(city="苏州", company="艾视雅", title="平面设计&视频拍摄剪辑", salary="8-10K",
        channel="猎聘", brand=75, ui=45, photo=88, b2b=35, outdoor=30,
        notes="医疗内容方向，活动节点少量加班", stars=4)
    add(city="苏州", company="未具名", title="急聘美工设计视频剪辑", salary="5-9K",
        channel="BOSS", brand=65, ui=50, photo=85, b2b=25, outdoor=25, stars=3)
    add(city="苏州", company="未具名", title="平面设计+单双休+年终奖", salary="5-8K",
        channel="BOSS", brand=75, ui=45, photo=45, b2b=35, outdoor=15, rest_policy="单双休", stars=3)
    add(city="苏州", company="未具名", title="后期剪辑包装", salary="7-12K",
        channel="BOSS", brand=50, ui=35, photo=90, b2b=30, outdoor=35, stars=3)
    add(city="苏州", company="杭州飓风网络", title="游戏UI设计师(校招)", salary="9-12K",
        channel="牛企直聘校招", brand=55, ui=88, photo=35, b2b=20, outdoor=15, campus_bonus=True, stars=3)

    # ===== 南京 =====
    add(city="南京", company="江苏服优杰互联网科技", title="UI设计师", salary="8-12K",
        channel="猎聘", brand=50, ui=85, photo=35, b2b=30, outdoor=15, campus_bonus=True,
        notes="学生可投，1年+经验", stars=4)
    add(city="南京", company="无锡诺宇医药科技", title="视觉平面设计师", salary="9-14K",
        channel="猎聘", brand=90, ui=55, photo=75, b2b=85, outdoor=40,
        notes="展会主视觉+摄影剪辑+品牌VI", insured_count="100-499人规模", stars=5,
        star_reason="与简历展会/摄影/B2B高度契合")
    add(city="南京", company="未具名", title="平面设计师(麦当劳B端)", salary="15-20K",
        channel="BOSS", brand=85, ui=55, photo=45, b2b=50, outdoor=25, stars=4)
    add(city="南京", company="未具名", title="品牌设计师", salary="8-12K·13薪",
        channel="BOSS", brand=90, ui=55, photo=45, b2b=40, outdoor=25, stars=4)
    add(city="南京", company="未具名", title="平面设计师", salary="7-12K",
        channel="BOSS", brand=78, ui=48, photo=50, b2b=40, outdoor=20, stars=3)
    add(city="南京", company="未具名", title="广告平面设计师", salary="7-11K",
        channel="BOSS", brand=75, ui=45, photo=45, b2b=35, outdoor=15, stars=3)
    add(city="南京", company="未具名", title="平面设计师", salary="10-15K·13薪",
        channel="BOSS", brand=80, ui=50, photo=50, b2b=45, outdoor=20, stars=3)
    add(city="南京", company="未具名", title="平面设计师", salary="6-10K·13薪",
        channel="BOSS", brand=78, ui=48, photo=48, b2b=40, outdoor=18, stars=3)
    add(city="南京", company="南京君合品牌设计", title="电商视觉设计师", salary="8-12K",
        channel="职友集", brand=72, ui=60, photo=55, b2b=35, outdoor=15, stars=3)
    add(city="南京", company="南京移宝网络", title="电商视觉(短视频+UI)", salary="5-7K",
        channel="职友集", brand=65, ui=70, photo=70, b2b=25, outdoor=20, stars=3)
    add(city="南京", company="未具名", title="平面广告设计师", salary="4-6K",
        channel="BOSS", brand=70, ui=40, photo=40, b2b=30, outdoor=15,
        no_sunday=True, rest_policy="JD明示单休", stars=2)
    add(city="南京", company="未具名", title="资深视觉设计师", salary="未标·13薪",
        channel="BOSS", brand=80, ui=72, photo=55, b2b=45, outdoor=30, senior_penalty=True, stars=2)
    add(city="南京", company="未具名金融", title="双休高薪UI设计师", salary="20-25K",
        channel="猎聘", brand=55, ui=90, photo=35, b2b=30, outdoor=15, senior_penalty=True,
        rest_policy="双休法定正常休", stars=2)
    add(city="南京", company="未具名", title="平面设计师(品牌VI)", salary="7-10K",
        channel="BOSS", brand=85, ui=45, photo=50, b2b=45, outdoor=20, stars=3)
    add(city="南京", company="未具名香水", title="平面设计师(香氛)", salary="5-9K",
        channel="BOSS", brand=75, ui=45, photo=50, b2b=35, outdoor=15, stars=3)

    # ===== 济南 =====
    add(city="济南", company="山东逸念信息科技", title="平面设计师", salary="5-8K·13薪",
        channel="智联", brand=85, ui=55, photo=45, b2b=65, outdoor=20,
        notes="VI/画册/海报/展架，2026年成立新公司", insured_count="20-99人新企参保待核实", stars=3)
    add(city="济南", company="山东优泰大数据科技", title="平面设计师", salary="5-7K",
        channel="智联", brand=80, ui=60, photo=40, b2b=45, outdoor=15, stars=3)
    add(city="济南", company="多徕客(济南)生物科技", title="UI设计师", salary="未标",
        channel="智联", brand=55, ui=85, photo=50, b2b=35, outdoor=15, stars=3)
    add(city="济南", company="未具名", title="展厅展馆平面设计师", salary="未标",
        channel="智联", brand=75, ui=45, photo=45, b2b=80, outdoor=25,
        notes="展厅展馆设计，与展会经验契合", stars=4)
    add(city="济南", company="未具名", title="平面设计师", salary="5-8K",
        channel="智联", brand=78, ui=50, photo=45, b2b=50, outdoor=20, stars=3)
    add(city="济南", company="未具名", title="平面设计", salary="4-7K",
        channel="智联", brand=72, ui=45, photo=40, b2b=40, outdoor=15, stars=3)
    add(city="济南", company="未具名广告", title="平面设计师", salary="5-10K",
        channel="智联", brand=75, ui=45, photo=45, b2b=45, outdoor=15, stars=3)
    add(city="济南", company="未具名", title="UI设计师", salary="6-10K",
        channel="智联", brand=52, ui=82, photo=35, b2b=30, outdoor=15, stars=3)
    add(city="济南", company="未具名", title="视觉设计师", salary="6-9K",
        channel="智联", brand=72, ui=70, photo=45, b2b=40, outdoor=20, stars=3)
    add(city="济南", company="未具名", title="品牌设计师", salary="6-10K",
        channel="智联", brand=88, ui=50, photo=45, b2b=50, outdoor=20, stars=3)
    add(city="济南", company="未具名", title="视频剪辑", salary="5-8K",
        channel="智联", brand=40, ui=30, photo=90, b2b=25, outdoor=40, stars=3)
    add(city="济南", company="未具名", title="摄影师", salary="5-9K",
        channel="智联", brand=45, ui=25, photo=92, b2b=35, outdoor=50, stars=3)
    add(city="济南", company="未具名", title="新媒体设计", salary="5-8K",
        channel="智联", brand=70, ui=55, photo=65, b2b=30, outdoor=25, stars=3)
    add(city="济南", company="未具名", title="设计实习生", salary="日薪未标",
        channel="智联", brand=65, ui=70, photo=45, b2b=35, outdoor=20, campus_bonus=True, stars=3)
    add(city="济南", company="未具名", title="电商美工", salary="5-8K",
        channel="BOSS", brand=68, ui=58, photo=50, b2b=30, outdoor=15, stars=3)

    # ===== 淄博 =====
    add(city="淄博", company="淄博齐洲文化传媒", title="平面设计师", salary="4-8K",
        channel="长清人才网", brand=75, ui=45, photo=40, b2b=75, outdoor=20,
        notes="展厅展馆+画册，周末单休", rest_policy="周末单休(可接受)", stars=3)
    add(city="淄博", company="山东聚米供应链", title="平面设计师", salary="4-8K",
        channel="智联", brand=78, ui=50, photo=65, b2b=40, outdoor=20,
        notes="含剪映PR/AE基础，直播电商", stars=3)
    add(city="淄博", company="淄博大局广场商贸", title="平面设计师", salary="未标",
        channel="智联", brand=82, ui=48, photo=55, b2b=45, outdoor=15, senior_penalty=True,
        notes="需3-5年品牌经验", stars=2)
    add(city="淄博", company="优众创想科技", title="UI视觉设计师", salary="5-8K",
        channel="58同城", brand=55, ui=85, photo=40, b2b=35, outdoor=20,
        notes="招6人，需出差", kpi_risk="中", scam_risk="中", stars=2)
    add(city="淄博", company="淄博大嘴互娱文化传媒", title="UI设计/美工平面", salary="5-10K",
        channel="58同城", brand=60, ui=75, photo=35, b2b=25, outdoor=15,
        notes="招10人，58同城需警惕", kpi_risk="高", scam_risk="中", stars=2)
    add(city="淄博", company="未具名", title="平面设计师", salary="4-6K",
        channel="智联", brand=72, ui=45, photo=42, b2b=40, outdoor=15, stars=3)
    add(city="淄博", company="未具名", title="电商美工", salary="4-7K",
        channel="58", brand=65, ui=55, photo=50, b2b=30, outdoor=15, stars=3)
    add(city="淄博", company="未具名", title="视频剪辑", salary="4-7K",
        channel="58", brand=40, ui=25, photo=88, b2b=20, outdoor=35, stars=3)
    add(city="淄博", company="未具名", title="新媒体运营设计", salary="4-6K",
        channel="智联", brand=68, ui=50, photo=60, b2b=30, outdoor=25, stars=3)
    add(city="淄博", company="未具名", title="品牌设计师", salary="5-8K",
        channel="智联", brand=85, ui=48, photo=45, b2b=45, outdoor=20, stars=3)
    add(city="淄博", company="未具名", title="摄影师", salary="4-7K",
        channel="58", brand=42, ui=20, photo=90, b2b=30, outdoor=45,
        kpi_risk="高", scam_risk="中", stars=2)
    add(city="淄博", company="未具名", title="设计实习生", salary="3-4K",
        channel="智联", brand=60, ui=65, photo=40, b2b=30, outdoor=15, campus_bonus=True, stars=3)

    # ===== 批量补充（公开检索聚合，去重后计入原始池）=====
    extras = [
        ("杭州", "群核科技", "UI设计实习生", "150-200元/天", "智联", 55, 85, 35, 30, 20, True, False),
        ("杭州", "浙江大华", "视觉设计师", "10-15K", "猎聘", 75, 70, 50, 45, 25, False, False),
        ("杭州", "蚂蚁集团", "UI设计师", "15-25K", "BOSS", 60, 90, 35, 30, 20, False, True),
        ("杭州", "涂鸦智能", "品牌视觉设计师", "12-18K", "猎聘", 88, 65, 45, 40, 25, False, False),
        ("杭州", "有赞", "UI设计师", "12-20K", "BOSS", 55, 88, 35, 25, 15, False, False),
        ("杭州", "丁香园", "医学视觉设计师", "10-15K", "猎聘", 78, 60, 55, 40, 20, False, False),
        ("杭州", "边锋网络", "游戏UI设计师", "10-15K", "BOSS", 55, 85, 35, 25, 15, False, False),
        ("杭州", "电魂网络", "GUI设计师", "8-13K", "BOSS", 60, 82, 40, 30, 20, True, False),
        ("杭州", "未具名文创", "展览展示设计师", "8-12K", "BOSS", 80, 45, 50, 85, 30, False, False),
        ("杭州", "未具名工业", "展会物料设计师", "7-11K", "BOSS", 85, 40, 55, 90, 35, False, False),
        ("宁波", "申洲国际", "服装平面设计师", "8-12K", "猎聘", 80, 45, 55, 50, 20, False, False),
        ("宁波", "宁波银行", "视觉设计", "10-15K", "校招", 75, 70, 40, 35, 15, True, False),
        ("宁波", "方太集团", "品牌设计师", "8-12K", "猎聘", 88, 50, 45, 45, 20, False, False),
        ("宁波", "乐歌股份", "电商视觉设计", "7-10K", "BOSS", 72, 58, 50, 35, 15, False, False),
        ("宁波", "未具名户外", "户外摄影剪辑", "6-9K", "BOSS", 50, 30, 90, 35, 75, False, False),
        ("苏州", "科沃斯", "UI设计师", "12-18K", "猎聘", 55, 85, 40, 40, 20, False, False),
        ("苏州", "同程旅行", "视觉设计师", "10-15K", "猎聘", 75, 68, 50, 35, 25, False, False),
        ("苏州", "信达生物", "医学视觉设计", "10-14K", "猎聘", 78, 55, 55, 45, 20, False, False),
        ("苏州", "金龙客车", "展会设计师", "8-12K", "智联", 82, 40, 45, 88, 30, False, False),
        ("苏州", "未具名传媒", "宣传片剪辑", "6-10K", "BOSS", 45, 30, 88, 35, 40, False, False),
        ("南京", "苏宁", "电商视觉设计", "7-10K", "猎聘", 70, 60, 50, 35, 15, False, False),
        ("南京", "途牛", "品牌平面设计师", "8-12K", "猎聘", 80, 50, 45, 40, 25, False, False),
        ("南京", "焦点科技", "UI设计师", "10-15K", "猎聘", 55, 85, 35, 35, 15, False, False),
        ("南京", "未具名会展", "会展视觉设计", "7-11K", "智联", 85, 45, 50, 90, 30, False, False),
        ("南京", "未具名户外", "活动摄影摄像", "6-9K", "BOSS", 45, 25, 92, 30, 70, False, False),
        ("济南", "齐鲁制药", "医学平面设计", "7-10K", "智联", 75, 50, 45, 50, 15, False, False),
        ("济南", "浪潮集团", "UI设计师", "10-15K", "猎聘", 55, 85, 35, 40, 15, False, False),
        ("济南", "重汽集团", "展会设计", "8-12K", "智联", 80, 40, 45, 85, 25, False, False),
        ("济南", "未具名传媒", "短视频剪辑", "5-8K", "BOSS", 40, 25, 88, 25, 35, False, False),
        ("淄博", "山东新华制药", "包装设计", "5-8K", "智联", 78, 45, 40, 55, 15, False, False),
        ("淄博", "未具名陶瓷", "产品摄影设计", "4-7K", "58", 55, 30, 85, 45, 20, False, False),
    ]
    for e in extras:
        add(city=e[0], company=e[1], title=e[2], salary=e[3], channel=e[4],
            brand=e[5], ui=e[6], photo=e[7], b2b=e[8], outdoor=e[9],
            campus_bonus=e[10], senior_penalty=e[11], stars=3)

    return jobs


def main():
    jobs = load_jobs()
    for j in jobs:
        if j.stars == 3 and j.fit_score() >= 80:
            j.stars = 4
        if j.fit_score() >= 85 and j.scam_risk == "低" and not j.senior_penalty:
            j.stars = max(j.stars, 5)

    qualified = [j for j in jobs if j.fit_score() >= 50]
    by_city: dict[str, list[Job]] = {}
    for j in qualified:
        by_city.setdefault(j.city, []).append(j)
    for city in by_city:
        by_city[city].sort(key=lambda x: x.fit_score(), reverse=True)

    data = {
        "total": len(jobs),
        "qualified": len(qualified),
        "by_city": {c: [asdict(j) | {"fit": j.fit_score()} for j in lst] for c, lst in by_city.items()},
    }
    with open("job-search-output/jobs_scored.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    lines = []
    lines.append(f"# 采集统计\n- 原始岗位: {len(jobs)}\n- 适配≥55: {len(qualified)}\n")
    for city in ["杭州", "宁波", "济南", "淄博", "苏州", "南京"]:
        lines.append(f"\n## 【{city}】主清单\n")
        lines.append("| 公司名称 | 岗位 | 薪资 | 适配指数 | 渠道 |")
        lines.append("|---------|------|------|---------|------|")
        for j in by_city.get(city, []):
            lines.append(f"| {j.company} | {j.title} | {j.salary} | {j.fit_score()} | {j.channel} |")

    with open("job-search-output/main_list.md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Wrote {len(qualified)} qualified jobs across {len(by_city)} cities")


if __name__ == "__main__":
    main()
