<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <h4 align="center" style="font-weight:700">Упутство за коришћење</h4>
      </b-col>
    </b-row>
    <br>
    <b-row>
      <b-col>
        <p style="text-align:center;font-weight:700">
          1) Поставке
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p style="text-align:justify">
          Поставке апликације се врше у секцији ”Подешавања”.
          Пре почетка употребе потребно је подесити партије и позиције примања и издавања, као и назив манастира и места у ком се налази. 
          Поставком ових подешавања аутоматски се попуњавају одговарајућа поља уплатница, признаница и дневника благајне, што апликацију чини спремном за унос података дневника за жељену годину. Опција ”Подразумевано зумирање” омогућава подешавања жељеног нивоа зумирања.
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p style="text-align:center;font-weight:700">
          2) Подаци
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p style="text-align:justify">
          Подаци дневника су подељени у секције, где се унети подаци приказују у табелама. Сваки унос је ограничен према могућем приказу у дневнику благајне, те се о томе не мора водити рачуна. 
          Такође, уколико се дода више уплатница, признаница и других података него што стаје на једну страницу дневника, аутоматски се додаје нова страница.
          Генерални подаци дневника се уносе у секцији ”Дневник благајне”, након избора жељене године књижења, где се године аутоматски додају по уносу података за одређену годину.
          Битно је нагласити да се дневник благајне генерише на основу унетих података, што значи да се свака измена аутоматски рефлектује на дневник.
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p style="text-align:center;font-weight:700">
          3) Функционалности
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p style="text-align:justify">
          Податке је могуће додавати, мењати и брисати. Брисање је омогућено за више уноса одједном означавањем више ставки табеле, или појединачно. Табеле унутар секција омогућавају једноставан преглед унетих података и могу се филтрирати по години, као и сортирати кликом на заглавље колона које то имају омогућено. 
          Свака унета уплатница и признаница се може по чувању преузети и штампати. Исто важи и за странице дневника благајне, а постоји и опција да се преузме и штампа цео дневник. 
          Преглед дневника благајне се може извршити у сваком тренутку на дну секције ”Дневник благајне”. У току прегледа, навигација кроз стране се може упростити коришћењем пречица на врху приказа.
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p style="text-align:center;font-weight:700">
          4) Пречице
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p align="center"><b>{{phrases.commandOrControl}}</b> + <b>s</b>&nbsp;&nbsp;&nbsp;сачувај</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p align="center"><b>{{phrases.commandOrControl}}</b> + <b>e</b>&nbsp;&nbsp;&nbsp;обриши унето</p>
      </b-col>
    </b-row>    
    <b-row>
      <b-col>  
        <p align="center"><b>{{phrases.commandOrControl}}</b> + <b>p</b>&nbsp;&nbsp;&nbsp;штампај</p>
      </b-col>
    </b-row>    
    <b-row>
      <b-col>        
        <p align="center"><b>{{phrases.commandOrControl}}</b> + <b>d</b>&nbsp;&nbsp;&nbsp;преузми</p>
      </b-col>
    </b-row>    
    <b-row>
      <b-col>       
        <p align="center"><b>{{phrases.commandOrControl}}</b> + <b>=</b>&nbsp;&nbsp;&nbsp;зумирај</p>
      </b-col>
    </b-row>    
    <b-row>
      <b-col>        
        <p align="center"><b>{{phrases.commandOrControl}}</b> + <b>-</b>&nbsp;&nbsp;&nbsp;одзумирај</p>
      </b-col>
    </b-row>
    <br> 
    <b-row>
      <b-col>
        <h4 align="center" style="font-weight:700">Техничка подршка</h4>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p align="center">daxon.tech@outlook.com</p>
        <p align="center">+381642750071</p>
      </b-col>
    </b-row>
    <hr>
    <br>
    <p align="center">Апликација је лиценцирана од стране агенције DAXON TECH и на њу полаже ауторска права. &copy;</p>
  </b-container>
</template>

<script>
  const i18n = require('../../../../translations/i18n')

  export default {
    data () {
      return {
        phrases: {
          commandOrControl: 'ctrl'
        }
      }
    },
    created () {
       if (process.platform == 'darwin') {
        this.phrases.commandOrControl = 'cmd'
      }
    }
  }
</script>
