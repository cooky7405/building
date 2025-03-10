"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "제목은 최소 2자 이상이어야 합니다.",
  }),
  content: z.string().min(10, {
    message: "내용은 최소 10자 이상이어야 합니다.",
  }),
  priority: z.string().default("normal"),
  requiresConfirmation: z.boolean().default(true),
  requiresCompletion: z.boolean().default(false),
  completionDeadline: z.string().optional(),
});

export default function CreateNoticePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  // const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "normal",
      requiresConfirmation: true,
      requiresCompletion: false,
      completionDeadline: "",
    },
  });

  const requiresCompletion = form.watch("requiresCompletion");

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 여기서 실제로는 API에 데이터를 전송할 것입니다
    console.log(values);

    toast("공지가 생성되었습니다", {
      description: "공지가 성공적으로 생성되었습니다.",
    });

    router.push(`/buildings/${params.id}/notices`);
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">새 공지 작성</h1>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>공지 정보</CardTitle>
          <CardDescription>
            새로운 공지를 작성하세요. 중요도를 설정하고 확인 및 작업 완료 요구
            여부를 선택할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="공지 제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>중요도</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="중요도를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">낮음</SelectItem>
                        <SelectItem value="normal">보통</SelectItem>
                        <SelectItem value="high">높음</SelectItem>
                        <SelectItem value="urgent">긴급</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="공지 내용을 입력하세요"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="requiresConfirmation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>확인 요구</FormLabel>
                        <FormDescription>
                          입주자가 이 공지를 확인했는지 여부를 추적합니다.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresCompletion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>작업 완료 요구</FormLabel>
                        <FormDescription>
                          이 공지가 작업 완료를 요구하는지 설정합니다.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {requiresCompletion && (
                <FormField
                  control={form.control}
                  name="completionDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>작업 완료 기한</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        작업이 완료되어야 하는 기한을 설정하세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  취소
                </Button>
                <Button type="submit">공지 생성</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
