import { Text, View, Link, StyleSheet } from "@react-pdf/renderer";

import { remark } from "remark";
import remarkGfm from "remark-gfm";

// Create styles for the markdown elements
const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  h2: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  h3: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  h4: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  h5: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  h6: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  p: { fontSize: 10, marginBottom: 5, lineHeight: 1.5 },
  strong: { fontWeight: "bold" },
  em: { fontStyle: "italic" },
  li: { flexDirection: "row", marginBottom: 4 },
  listItemContent: { flex: 1 },
  listDot: { width: 15, marginRight: 5, fontSize: 10 },
});

interface RenderContext {
  listDepth: number;
  ordered: boolean;
  index: number;
}

// The recursive renderer function
function renderNode(node: any, context: Partial<RenderContext> = {}): any {
  const { type } = node;

  switch (type) {
    case "root":
      return node.children.map((child: any, i: number) =>
        renderNode(child, { ...context, index: i }),
      );

    case "heading":
      const headingKey = `h${node.depth}` as keyof typeof styles;
      const style = styles[headingKey] || styles.p;
      return (
        <Text key={context.index} style={style}>
          {node.children.map((child: any, i: number) =>
            renderNode(child, { ...context, index: i }),
          )}
        </Text>
      );

    case "paragraph":
      return (
        <Text key={context.index} style={styles.p}>
          {node.children.map((child: any, i: number) =>
            renderNode(child, { ...context, index: i }),
          )}
        </Text>
      );

    case "text":
      return node.value;

    case "strong":
      return (
        <Text key={context.index} style={styles.strong}>
          {node.children.map((child: any, i: number) =>
            renderNode(child, { ...context, index: i }),
          )}
        </Text>
      );

    case "emphasis":
      return (
        <Text key={context.index} style={styles.em}>
          {node.children.map((child: any, i: number) =>
            renderNode(child, { ...context, index: i }),
          )}
        </Text>
      );

    case "list":
      const listDepth = (context.listDepth || 0) + 1;
      return (
        <View
          key={context.index}
          style={{ marginLeft: (listDepth - 1) * 15, marginTop: 5 }}
        >
          {node.children.map((child: any, i: number) =>
            renderNode(child, { ...context, index: i, listDepth, ordered: node.ordered }),
          )}
        </View>
      );

    case "listItem":
      const bullet = context.ordered ? `${(context.index || 0) + 1}.` : "•";
      return (
        <View key={context.index} style={styles.li}>
          <Text style={styles.listDot}>{bullet}</Text>
          <View style={styles.listItemContent}>
            {node.children.map((child: any, i: number) =>
              renderNode(child, { ...context, index: i }),
            )}
          </View>
        </View>
      );

    case "link":
      return (
        <Link key={context.index} src={node.url}>
          {node.children.map((child: any, i: number) =>
            renderNode(child, { ...context, index: i }),
          )}
        </Link>
      );

    case "thematicBreak":
      return (
        <View
          key={context.index}
          style={{ borderBottom: "1px solid #cccccc", marginVertical: 10 }}
        />
      );

    default:
      return node.children
        ? node.children.map((child: any, i: number) =>
            renderNode(child, { ...context, index: i }),
          )
        : null;
  }
}

const processor = remark().use(remarkGfm);

export function PdfMarkdown({ children }: { children: string }) {
  if (typeof children !== "string") {
    return null;
  }
  const tree = processor.parse(children);
  return renderNode(tree);
}
