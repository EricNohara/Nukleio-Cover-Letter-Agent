import writingAnalysisAgent from "../agents/writingAnalysisAgent";
import OpenAI from "openai";
import getOpenAIClient from "../utils/ai/getOpenAIClient";

const sample = `
Throughout South African folklore, there exists an extensive subgenre of legends and stories featuring supernatural events. Specimens of Bushman Folklore by Wilhelm H. I. Bleek, and Lucy C. Lloyd, features a large collection of such mythological stories, and these stories provide an important and unique view into the culture of the San people. One particularly striking pattern seen throughout many of these folktales is the repeated focus on themes of transformation and power. This headnote will first analyze the role of animals within South African literature before exploring the various supernatural events that occur within three short stories from Bleek and Lloyd’s collection. It will contextualize these events with the goal of interpreting the San people’s cultural ideas on the themes of power, transformation, and submission to greater forces.
	Before analyzing these supernatural events, it is important to note the importance and prevalence of animals throughout South African folklore. These stories often use animals as their main characters or feature a human transforming into an animal as a main plot point. Jacob Kehinde Olupona explains that “animals feature prominently in cosmogonic myths by conveying the sacred power and messages with which the primordial chaos was transformed into the habitable cosmos” (Olupona 3). In other words, animals act as examples to learn from and are used to convey the power of the natural world. This phenomenon can be seen in all three stories selected. “The Origin of Death” features a human who argues with the Moon, a godlike entity, and is transformed into a hare as a result. “The Girl’s Story; the Frog’s Story” reaches a climactic ending where a human who ate a supernatural water being is punished when her entire family is transformed into frogs. Finally, “The Death of the Lizard” uses a lizard’s dead body to explain the existence of a mountain range by stating that the lizard transformed into the landscape. Importantly, Olupona postulates that both humans and animals possess spirit doubles that have “quasi human and superhuman faculties” (5). So, in South African culture, the spirits of humans and animals can be viewed as equal. This spiritual connection between humans and animals explains why so many San folktales revolve around transformations between the two. It also shows how South Africans use animals as characters as a cultural device to convey important lessons in a story format, as well as how they maintain their spiritual relevance to humans. Keeping this in mind, the themes present within South African folklore become clearer. 
`;

async function runAnalysis() {
  const clientOpenAI: OpenAI = getOpenAIClient();
  const result = await writingAnalysisAgent(clientOpenAI, sample);
  console.log(result);
}

runAnalysis();
