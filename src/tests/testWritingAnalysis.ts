import writingAnalysisAgent from "../agents/writingAnalysisAgent";
import OpenAI from "openai";
import getOpenAIClient from "../utils/ai/getOpenAIClient";

const sample = `
(Wake up, F1LTHY)
Huh
Huh, huh, huh, huh

[Chorus: Ken Carson]
And the Kel-Tec'll make a nigga flip like gymnastics
I fuck Barbie bitches, yeah, yeah, all my hoes plastic
All my hoes know how to act, all my hoes classy
All my hoes fuck me like they life on the line
She fuckin' with the gang, yeah, she know every gang sign
If I call her, she gon' pull up, yeah, every time
I got one in the head, yeah, of my .9
I'm paranoid, I'll take your life, yeah, before you take minе
Yeah, I'm paranoid

[Verse: Destroy Lonely]
Yeah, I'm paranoid
I got white diamonds and thеy colder than Illinois
I like freak hoes, they ain't fuckin' with y'all boys
I do free throws, I've been ballin' with no court
Lil' nigga, be quiet, you ain't makin' no noise
And my weed way louder than a speaker, lil' boy
Lil' shawty tryna fuck on me 'cause she know I been the boy
I been havin' cash, I been gettin' money, yeah, boy
I'm in a Trackhawk, I do supercharging to it
My FN souped-up, this is not a toy
And I need my money first, before you proceed to move forward
And I got your ho on her knees, 'cause she know she just met the Lord
`;

async function runAnalysis() {
  const clientOpenAI: OpenAI = getOpenAIClient();
  const result = await writingAnalysisAgent(clientOpenAI, sample);
  console.log(result);
}

runAnalysis();
